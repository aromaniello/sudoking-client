import React from 'react';
import Cell from './Cell'
import '../stylesheets/Board.css';
import { range, remove, countBy, forEach, compact, filter, reduce } from 'lodash';

type NullableNumber = number | null;

interface BoardCell {
  row: number,
  column: number,
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
  selectedCell: BoardCell | null,
  board: any,
  inPencilNoteMode: boolean
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
          value: initialValue ? initialValue : null,
          isOriginal: !!initialValue,
          pencilNotes: [],
          error: false
        };

        return cell;
      })
    })

    this.state = {
      selectedCell: null,
      board: board,
      inPencilNoteMode: false
    }

    this.clickCell = this.clickCell.bind(this);
  }

  cellState(cell: BoardCell) {
    const pencilNotesLength = cell.pencilNotes.length;

    if (cell.value && pencilNotesLength === 0) {
      return CellState.Value;

    } else if (cell.value === null && pencilNotesLength > 0) {
      return CellState.PencilNote;

    } else if (cell.value === null && pencilNotesLength === 0) {
      return CellState.Empty;

    } else {
      throw new Error(`Invalid cell state: ${cell}`)
    }
  }

  setCellValue(cell: BoardCell, newValue: NullableNumber) {
    if (cell.isOriginal) return;

    this.setState((previousState) => {
      let newBoard: SudokuBoard = [...previousState.board];
      let newCell: BoardCell = newBoard[cell.row][cell.column];

      if (this.state.inPencilNoteMode) {
        if (newValue && !newCell.pencilNotes.includes(newValue))
          newCell.pencilNotes.push(newValue);
        newCell.value = null;
      } else {
        newCell.value = newValue;
        newCell.pencilNotes = [];
      }

      newBoard = this.setErrorCells(newBoard);

      if (this.checkSuccess(newBoard)) {
        alert("yay!");
      }

      return { ...previousState, board: newBoard }
    });
  }

  checkSuccess(board: SudokuBoard) {
    return this.countValueCells(board) === 81 && this.countErrorCells(board) === 0;
  };

  removePencilNote(cell: BoardCell, removeValue: number) {
    this.setState((previousState) => {
      const newBoard: SudokuBoard = [...previousState.board]
      const pencilNotes: number[] = newBoard[cell.row][cell.column].pencilNotes;

      remove(pencilNotes, (n) => n === removeValue)

      return { ...previousState, board: newBoard }
    });
  }

  deletePencilNotes(cell: BoardCell) {
    if (cell.isOriginal) return;

    this.setState((previousState) => {
      const newBoard: SudokuBoard = [...previousState.board];
      const newCell: BoardCell = newBoard[cell.row][cell.column];

      newCell.pencilNotes = [];

      return { ...previousState, board: newBoard }
    });
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
    const cell = this.state.board[row][column];

    this.setState((previousState) => {
      return { ...previousState, selectedCell: cell }
    })
  }

  clickNumberButton(event: any) {
    const selectedCell = this.state.selectedCell;

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
      return { ...previousState, inPencilNoteMode: newPencilNoteMode }
    });
  }

  clickEraseButton() {
    const selectedCell = this.state.selectedCell;
    if (!selectedCell) return;

    if (this.cellState(selectedCell) === CellState.Value) {
      this.setCellValue(selectedCell, null);
    } else if (this.cellState(selectedCell) === CellState.PencilNote) {
      this.deletePencilNotes(selectedCell);
    }
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
    const selectedCell = this.state.selectedCell;
    const isSelected = !!selectedCell && selectedCell.row === row && selectedCell.column === column
    const cell = this.state.board[row][column];

    return (
      <Cell value={cell.value} row={row} column={column} pencilNotes={cell.pencilNotes}
            isOriginal={cell.isOriginal} isSelected={isSelected} hasError={cell.error}
            clickCell={this.clickCell} />
    );
  }

  renderNumberButtons() {
    return range(9).map((index) => {
      const number = index + 1;
      const buttonId = `button-${number}`;

      return (
        <button id={buttonId} className="number-button" key={buttonId} data-number={number}
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
                className={`utility-button ${this.state.inPencilNoteMode ? 'selected' : ''}`}
                onClick={(e) => this.clickPencilModeButton()}>
          Pencil Mode
        </button>
        <button id="erase-button" className="utility-button"
                onClick={(e) => this.clickEraseButton()}>
          Erase
        </button>
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
        <div className="number-buttons">
          {this.renderNumberButtons()}
        </div>
        {this.renderUtilityButtons()}
      </div>
    );
  }
}

export default Board;
