import React from 'react';
import './App.css';
import { range, remove } from 'lodash';

type NullableNumber = number | null;

interface BoardProps {
  rows: number,
  columns: number
}

interface BoardState {
  selectedCell: [NullableNumber, NullableNumber],
  board: any,
  inPencilNoteMode: boolean
}

interface Cell {
  value: NullableNumber,
  isOriginal: boolean,
  pencilNotes: number[]
}

export default class Board extends React.Component<BoardProps, BoardState> {

  constructor(props: BoardProps) {
    super(props);

    const board = range(this.props.rows).map((row) => {
      return range(this.props.columns).map((column) => {
        const cell: Cell = {
          value: null,
          isOriginal: false,
          pencilNotes: []
        };

        return cell;
      })
    })

    //TODO: for testing purposes, will remove later
    board[1][2].value = 5;
    board[1][2].isOriginal = true;
    board[6][3].value = 9;
    board[6][3].isOriginal = true;
    board[5][7].value = 2;
    board[5][7].isOriginal = true;

    this.state = {
      selectedCell: [null, null],
      board: board,
      inPencilNoteMode: false
    }
  }

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
    const isSelected = this.state.selectedCell[0] === row && this.state.selectedCell[1] === column
    const cell = this.state.board[row][column];

    const hasPencilNotes = cell.pencilNotes.length > 0;
    const isCustom = !cell.isOriginal;
    const cellValue = cell.value;

    let classes = [
      'sk-cell',
      isSelected ? 'selected' : '',
    ]

    if (hasPencilNotes) {
      classes.push('pencil-note')

      return (
        <td id={`cell-${row}-${column}`} className={classes.join(' ')}
            key={`cell-${row}-${column}`} data-row={row} data-column={column}
            onClick={(event) => this.clickCell(event)}>
          <table>
            <tbody>
              {this.pencilNoteRow(cell, row, column, [1, 2, 3])}
              {this.pencilNoteRow(cell, row, column, [4, 5, 6])}
              {this.pencilNoteRow(cell, row, column, [7, 8, 9])}
            </tbody>
          </table>
        </td>
      );
    } else {
      if (isCustom)
        classes.push('custom')

      return (
        <td id={`cell-${row}-${column}`} className={classes.join(' ')}
        key={`cell-${row}-${column}`} data-row={row} data-column={column}
        onClick={(event) => this.clickCell(event)}>
        {cellValue ? cellValue : ''}
        </td>
      );
    }
  }

  pencilNoteRow(cell: any, row: number, column: number, values: number[]) {
    const cells = values.map((value) => {
      return (
        <td className="pencil-note-cell" key={`pencil-note-${row}-${column}-${value}`}>
          {this.pencilNoteValue(cell, value)}
        </td>
      );
    });

    return (<tr>{cells}</tr>);
  }

  pencilNoteValue(cell: Cell, value: number) {
    return cell.pencilNotes.includes(value) ? value : ' ';
  }

  clickCell(event: any) {
    const row = parseInt(event.target.dataset.row);
    const column = parseInt(event.target.dataset.column);

    this.setState((previousState) => {
      return { ...previousState, selectedCell: [row, column] }
    })
  }

  // TODO: remove if unused
  selectedCellId() {
    return `cell-${this.state.selectedCell[0]}-${this.state.selectedCell[1]}`;
  }

  cellIsSelected() {
    const row:    NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    const rowIsValid = typeof row === 'number'
                       && row >= 0
                       && row < this.props.rows;

    const columnIsValid = typeof column === 'number'
                          && column >= 0
                          && column < this.props.columns;

    return rowIsValid && columnIsValid;
  }

  clickNumberButton(event: any) {
    const selectedCell = this.selectedCell();

    if (!selectedCell) return;

    const buttonNumber = parseInt(event.target.dataset.number);

    if (this.inPencilNoteMode() && selectedCell.pencilNotes.includes(buttonNumber)) {
      this.removeSelectedCellPencilNote(buttonNumber);
    } else {
      this.setSelectedCellValue(buttonNumber);
    }
  }

  removeSelectedCellPencilNote(removeValue: number) {
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    if (typeof row === 'number' && typeof column === 'number') { //create new method and use guards?
      this.setState((previousState) => {
        const newBoard: any = [...previousState.board]
        const pencilNotes: number[] = newBoard[row][column].pencilNotes;

        remove(pencilNotes, (n) => n === removeValue)

        return { ...previousState, board: newBoard }
      });
    }
  }

  inPencilNoteMode() {
    return this.state.inPencilNoteMode;
  }

  clickPencilModeButton() {
    const newPencilNoteMode = !this.state.inPencilNoteMode;

    this.setState((previousState) => {
      return { ...previousState, inPencilNoteMode: newPencilNoteMode }
    });
  }

  clickEraseButton() {
    if (this.cellIsSelected()) {
      this.setSelectedCellValue(null);
      this.deleteSelectedCellPencilNotes();
    }
  }

  selectedCell() {
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    const rowIsValid = typeof row === 'number'
                       && row >= 0
                       && row < this.props.rows;

    const columnIsValid = typeof column === 'number'
                          && column >= 0
                          && column < this.props.columns;

    if (typeof row === 'number' && typeof column === 'number') { //TODO: need to remove
      if (rowIsValid && columnIsValid) {
        return this.state.board[row][column];
      } else {
        return null;
      }
    }
  }

  setSelectedCellValue(newValue: NullableNumber) { //TODO: change to pass in cell
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    // TODO: refactor to remove this condition
    if (typeof row === 'number' && typeof column === 'number') {
      if (this.state.board[row][column].isOriginal) return;

      this.setState((previousState) => {
        const newBoard: any = [...previousState.board];
        const cell: any = newBoard[row][column];

        if (this.state.inPencilNoteMode) {
          if (!cell.pencilNotes.includes(newValue))
            cell.pencilNotes.push(newValue); //TODO: might need to check that null is not passed
          cell.value = null;
        } else {
          cell.value = newValue;
          cell.pencilNotes = [];
        }

        return { ...previousState, board: newBoard }
      });
    }
  }

  deleteSelectedCellPencilNotes() { //TODO: change to pass in cell
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    // TODO: refactor to remove this condition
    if (typeof row === 'number' && typeof column === 'number') {
      if (this.state.board[row][column].isOriginal) return;

      this.setState((previousState) => {
        const newBoard: any = [...previousState.board];
        const cell: any = newBoard[row][column];

        cell.pencilNotes = [];

        return { ...previousState, board: newBoard }
      });
    }
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
