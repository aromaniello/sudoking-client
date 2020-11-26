import React from 'react';
import Cell from './Cell'
import './Board.css';
import { range, remove } from 'lodash';

type NullableNumber = number | null;

interface BoardCell {
  row: number,
  column: number,
  value: NullableNumber,
  isOriginal: boolean,
  pencilNotes: number[]
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
          pencilNotes: []
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
      const newBoard: SudokuBoard = [...previousState.board];
      const newCell: BoardCell = newBoard[cell.row][cell.column];

      if (this.state.inPencilNoteMode) {
        if (newValue && !newCell.pencilNotes.includes(newValue))
          newCell.pencilNotes.push(newValue);
        newCell.value = null;
      } else {
        newCell.value = newValue;
        newCell.pencilNotes = [];
      }

      return { ...previousState, board: newBoard }
    });
  }

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
            isOriginal={cell.isOriginal} isSelected={isSelected} clickCell={this.clickCell} />
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
        <table>
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
