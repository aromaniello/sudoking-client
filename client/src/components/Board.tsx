import React from 'react';
import Cell from './Cell'
import '../stylesheets/Board.css';
import { range, remove, countBy, forEach, compact, filter, reduce, cloneDeep } from 'lodash';

type NullableNumber = number | null;

interface BoardCell {
  row: number,
  column: number,
  quadrant: number,
  value: NullableNumber,
  isOriginal: boolean,
  pencilNotes: number[],
  error: boolean
}

type SudokuBoard = BoardCell[][];

interface BoardProps {
  rows: number,
  columns: number,
  initialValues: NullableNumber[][]
}

interface BoardState {
  selectedCell: [NullableNumber, NullableNumber],
  board: SudokuBoard,
  inPencilNoteMode: boolean,
  undoStates: SudokuBoard[],
  redoStates: SudokuBoard[]
}

enum CellState { Value, PencilNote, Empty }

class Board extends React.Component<BoardProps, BoardState> {

  constructor(props: BoardProps) {
    super(props);

    const board: SudokuBoard = range(props.rows).map((row) => {
      return range(props.columns).map((column) => {
        const initialValue = props.initialValues[row][column];

        const cell: BoardCell = {
          row: row,
          column: column,
          quadrant: this.quadrantFor(row, column),
          value: initialValue ? initialValue : null,
          isOriginal: !!initialValue,
          pencilNotes: [],
          error: false
        };

        return cell;
      })
    })

    this.state = {
      selectedCell: [null, null],
      board: board,
      inPencilNoteMode: false,
      undoStates: [],
      redoStates: []
    }

    this.clickCell = this.clickCell.bind(this);
  }

  quadrantFor(row: number, column: number): number {
    if (row <= 2 && column <= 2) {
      return 0;
    } else if (row <= 2 && column <= 5) {
      return 1;
    } else if (row <= 2 && column <= 8) {
      return 2;
    } else if (row <= 5 && column <= 2) {
      return 3;
    } else if (row <= 5 && column <= 5) {
      return 4;
    } else if (row <= 5 && column <= 8) {
      return 5;
    } else if (row <= 8 && column <= 2) {
      return 6;
    } else if (row <= 8 && column <= 5) {
      return 7;
    } else if (row <= 8 && column <= 8) {
      return 8;
    } else {
      throw Error("invalid quadrant for row and column.");
    }
  }

  selectedCell(): BoardCell | null {
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    if (row !== null && row >= 0 && row <= 8 &&
        column !== null && column >= 0 && column <= 8)
      return this.state.board[row][column];
    else
      return null;
  }

  cellState(cell: BoardCell) {
    const pencilNotesLength = cell.pencilNotes.length;

    if (cell.value && pencilNotesLength === 0) {
      return CellState.Value;

    } else if (!cell.value && pencilNotesLength > 0) {
      return CellState.PencilNote;

    } else if (!cell.value && pencilNotesLength === 0) {
      return CellState.Empty;

    } else {
      throw new Error(`Invalid cell state: ${cell}`)
    }
  }

  setCellValue(cell: BoardCell, newValue: NullableNumber) {
    if (cell.isOriginal) return;

    this.setState((previousState) => {
      let currentBoard:  SudokuBoard   = cloneDeep(previousState.board);
      let newUndoStates: SudokuBoard[] = cloneDeep(previousState.undoStates);
      newUndoStates.push(currentBoard);

      let newBoard: SudokuBoard = cloneDeep(previousState.board);
      let newCell:  BoardCell   = newBoard[cell.row][cell.column];

      if (this.state.inPencilNoteMode) {
        if (newValue && !newCell.pencilNotes.includes(newValue))
          newCell.pencilNotes.push(newValue);
        newCell.value = null;
      } else {
        newCell.value = newValue;
        newCell.pencilNotes = [];

        newBoard = this.removeRedundantPencilNotes(newBoard, newCell);
        newBoard = this.setErrorCells(newBoard);
      }

      if (this.checkSuccess(newBoard)) alert("Success!");

      return { ...previousState, board: newBoard, undoStates: newUndoStates };
    });
  }

  checkSuccess(board: SudokuBoard) {
    return this.countValueCells(board) === 81 && this.countErrorCells(board) === 0;
  };

  removePencilNote(cell: BoardCell, removeValue: number) {
    this.setState((previousState) => {
      let currentBoard:  SudokuBoard   = cloneDeep(previousState.board);
      let newUndoStates: SudokuBoard[] = cloneDeep(previousState.undoStates);
      newUndoStates.push(currentBoard);

      const newBoard: SudokuBoard = cloneDeep(previousState.board)
      const pencilNotes: number[] = newBoard[cell.row][cell.column].pencilNotes;

      remove(pencilNotes, (n) => n === removeValue)

      return { ...previousState, board: newBoard, undoStates: newUndoStates };
    });
  }

  deletePencilNotes(cell: BoardCell) {
    if (cell.isOriginal) return;

    this.setState((previousState) => {
      let currentBoard:  SudokuBoard   = cloneDeep(previousState.board);
      let newUndoStates: SudokuBoard[] = cloneDeep(previousState.undoStates);
      newUndoStates.push(currentBoard);

      const newBoard: SudokuBoard = cloneDeep(previousState.board);
      const newCell:  BoardCell   = newBoard[cell.row][cell.column];

      newCell.pencilNotes = [];

      return { ...previousState, board: newBoard, undoStates: newUndoStates }
    });
  }

  isNumberComplete(board: SudokuBoard, number: number) {
    let count = 0;

    // TODO: change to forEach
    for (let row=0; row < board.length; row++) {
      for (let column=0; column < board[0].length; column++) {
        if (board[row][column].value === number) {
          if (board[row][column].error)
            return false;

          count += 1;
        }
      }
    }
    return count === 9;
  }

  removeRedundantPencilNotes(board: SudokuBoard, targetCell: BoardCell) {
    if (targetCell.value === null) return board;

    // TODO: change to forEach
    for (let row=0; row < board.length; row++) {
      for (let column=0; column < board[0].length; column++) {
        const cell = board[row][column];

        if ((cell.row === targetCell.row || cell.column === targetCell.column || cell.quadrant === targetCell.quadrant) &&
            cell.pencilNotes.length > 0 && cell.pencilNotes.includes(targetCell.value)) {
          remove(cell.pencilNotes, (num) => num === targetCell.value);
        }
      }
    }

    return board;
  }

  /**
   * Checks the board for errors by row, column and quadrant. Sets the error flag to true
   * in cells that have an error. Returns a new board with the error flags set.
   *
   * @param  {SudokuBoard} board The board to check for errors
   * @return {SudokuBoard}       A new board with the error flags set
   */
  setErrorCells(board: SudokuBoard) {
    const newBoard: SudokuBoard = [...board];

    this.resetErrors(newBoard);
    this.setErrorsByRow(newBoard);
    this.setErrorsByColumn(newBoard);
    this.setErrorsByQuadrant(newBoard)

    return newBoard;
  }

  /**
   * Sets the error flag of each cell in the board to false. Modifies the board in place.
   *
   * @param  {SudokuBoard} board The board to reset
   */
  resetErrors(board: SudokuBoard) {
    for (let row=0; row < board.length; row++) {
      for (let column=0; column < board[0].length; column++) {
        board[row][column].error = false;
      }
    }
  }

  /**
   * Checks each row to see if a number is repeated and sets the error flag on each
   * cell with that number. Modifies the board in place.
   *
   *
   * @param  {SudokuBoard} board The board where to set errors
   */
  setErrorsByRow(board: SudokuBoard) {
    forEach(board, (row: BoardCell[]) => {
      const rowValues: number[] = compact(row.map((cell) => cell.value));
      const counts: any = countBy(rowValues);

      forEach(counts, (count, value) => {
        if (count > 1) {
          const cellsWithError = filter(row, (cell) => cell.value === parseInt(value));

          forEach(cellsWithError, (cell) => cell.error = true);
        }
      });
    });

    return board;
  }

  setErrorsByColumn(board: SudokuBoard) {
    return this.setErrorsByRow(this.transposeBoard(board));
  }

  setErrorsByQuadrant(board: SudokuBoard) {
    return this.setErrorsByRow(this.boardAsQuadrants(board));
  }

  /**
   * Returns a transpose of the board where the rows are the original board's columns
   * and viceversa. The new board points to the original board's cells.
   *
   * @param  {SudokuBoard} board The board to transpose
   * @return {SudokuBoard}       The transposed board
   */
  transposeBoard(board: SudokuBoard) {
    const transposedBoard: SudokuBoard = range(9).map((_) => []);

    for (let row=0; row < board.length; row++) {
      for (let column=0; column < board[0].length; column++) {
        transposedBoard[column][row] = board[row][column];
      }
    }

    return transposedBoard;
  };

  /**
   * Returns a new board where the rows contain the cells present in the original board's
   * quadrants. The new board points to the original board's cells.
   *
   * @param  {SudokuBoard} board The original board
   * @return {SudokuBoard}       The new board
   */
  boardAsQuadrants(board: SudokuBoard) {
    const quadrantBoard: SudokuBoard = range(9).map((_) => []);

    for (let row=0; row < board.length; row++) {
      for (let column=0; column < board[0].length; column++) {
        const cell = board[row][column];

        if (row <= 2) {
          if (column <= 2) {                        // 1st quadrant
            quadrantBoard[0].push(cell);
          } else if (column >= 3 && column <= 5) {  // 2nd quadrant
            quadrantBoard[1].push(cell);
          } else if (column <= 8) {                 // 3rd quadrant
            quadrantBoard[2].push(cell);
          }
        } else if (row >= 3 && row <= 5) {
          if (column <= 2) {                        // 4th quadrant
            quadrantBoard[3].push(cell);
          } else if (column >= 3 && column <= 5) {  // 5th quadrant
            quadrantBoard[4].push(cell);
          } else if (column <= 8) {                 // 6th quadrant
            quadrantBoard[5].push(cell);
          }
        } else if (row <= 8) {
          if (column <= 2) {                        // 7th quadrant
            quadrantBoard[6].push(cell);
          } else if (column >= 3 && column <= 5) {  // 8th quadrant
            quadrantBoard[7].push(cell);
          } else if (column <= 8) {                 // 9th quadrant
            quadrantBoard[8].push(cell);
          }
        }
      }
    }

    return quadrantBoard;
  }

  countValueCells(board: SudokuBoard): number {
    return reduce(board, (count, row) => {
      return count + compact(row.map((cell: BoardCell) => cell.value)).length
    }, 0);
  }

  countErrorCells(board: SudokuBoard): number {
    return reduce(board, (count, row) => {
      return count + compact(row.map((cell) => cell.error && !cell.isOriginal)).length
    }, 0)
  }

  // EVENT HANDLERS

  clickCell(event: any) {
    const row = parseInt(event.target.dataset.row);
    const column = parseInt(event.target.dataset.column);

    this.setState((previousState) => {
      const newState: BoardState = cloneDeep(previousState);

      newState.selectedCell = [row, column];

      return newState;
    });
  }

  clickNumberButton(event: any) {
    const selectedCell = this.selectedCell();
    if (!selectedCell) return;

    const buttonNumber = parseInt(event.target.dataset.number);

    if (this.state.inPencilNoteMode && selectedCell.pencilNotes.includes(buttonNumber)) {
      this.removePencilNote(selectedCell, buttonNumber);
    } else {
      this.setCellValue(selectedCell, buttonNumber);
    }
  }

  clickPencilModeButton() {
    const newPencilNoteMode = !this.state.inPencilNoteMode;

    this.setState((previousState) => {
      const newState = cloneDeep(previousState);

      // newState.inPencilNoteMode = newPencilNoteMode;

      return { ...newState, inPencilNoteMode: newPencilNoteMode}; // TODO: fix and remove the double copy
    });
  }

  clickEraseButton() {
    const selectedCell = this.selectedCell();
    if (!selectedCell) return;

    if (this.cellState(selectedCell) === CellState.Value) {
      this.setCellValue(selectedCell, null);
    } else if (this.cellState(selectedCell) === CellState.PencilNote) {
      this.deletePencilNotes(selectedCell);
    }
  }

  clickUndoButton() {
    if (this.state.undoStates.length === 0) return;

    this.setState((previousState) => {
      let currentBoard:  SudokuBoard   = cloneDeep(previousState.board);
      let newUndoStates: SudokuBoard[] = cloneDeep(previousState.undoStates);
      let newBoard:      any           = newUndoStates.pop();
      let newRedoStates: SudokuBoard[] = cloneDeep(previousState.redoStates);
      newRedoStates.push(currentBoard);

      return { ...previousState, board: newBoard, undoStates: newUndoStates, redoStates: newRedoStates };
    });
  }

  //TODO: refactor to eliminate repetition between undo and redo
  clickRedoButton() {
    if (this.state.redoStates.length === 0) return;

    this.setState((previousState) => {
      let currentBoard:  SudokuBoard   = cloneDeep(previousState.board);
      let newRedoStates: SudokuBoard[] = cloneDeep(previousState.redoStates);
      let newBoard:      any           = newRedoStates.pop();
      let newUndoStates: SudokuBoard[] = cloneDeep(previousState.undoStates);
      newUndoStates.push(currentBoard);

      return { ...previousState, board: newBoard, undoStates: newUndoStates, redoStates: newRedoStates };
    });
  }

  // RENDER METHODS

  renderBoard() {
    return range(this.props.rows).map((row) => {
      return this.tableRow(row);
    })
  }

  tableRow(row: number) {
    const cells = range(this.props.columns).map((column) => {
      return this.tableCell(row, column);
    });

    return (<tr className="sk-row" key={`row-${row}`}>{cells}</tr>);
  }

  tableCell(row: number, column: number) {
    const selectedCell = this.selectedCell();
    const isSelected = !!selectedCell && selectedCell.row === row && selectedCell.column === column;
    const cell = this.state.board[row][column];
    const isHighlighted = !!selectedCell
                          && selectedCell.value !== null
                          && selectedCell !== cell
                          && selectedCell.value === cell.value;
    const cellKey = `cell-${row}-${column}`;

    return (
      <Cell value={cell.value}
            row={row}
            column={column}
            key={cellKey}
            pencilNotes={cell.pencilNotes}
            isOriginal={cell.isOriginal}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            hasError={cell.error}
            clickCell={this.clickCell} />
    );
  }

  renderNumberButtons() {
    return range(9).map((index) => {
      const number = index + 1;
      const buttonId = `button-${number}`;
      const classes = ['number-button'];
      const isComplete = this.isNumberComplete(this.state.board, number);

      if (isComplete) classes.push('complete');

      return (
        <button id={buttonId} className={classes.join(' ')} key={buttonId} data-number={number}
                onClick={(event) => this.clickNumberButton(event)}>
          {number}
        </button>
      );
    });
  }

  renderUtilityButtons() {
    return (
      <div className="utility-buttons">
        <button id="pencil-mode-button"
                className={`utility-button pencil-mode-button ${this.state.inPencilNoteMode ? 'selected' : ''}`}
                onClick={(e) => this.clickPencilModeButton()}></button>
        <button id="erase-button" className="utility-button erase-button"
                onClick={(e) => this.clickEraseButton()}></button>
        <button id="undo-button" className="utility-button undo-button"
                onClick={(e) => this.clickUndoButton()}></button>
        <button id="redo-button" className="utility-button redo-button"
                onClick={(e) => this.clickRedoButton()}></button>
      </div>
    );
  }

  render() {
    return (
      <div className="sk-board">
        <table className="sk-table">
          <tbody>
            {this.renderBoard()}
          </tbody>
        </table>
        {this.renderUtilityButtons()}
        <div className="number-buttons">
          {this.renderNumberButtons()}
        </div>
      </div>
    );
  }
}

export default Board;
