import React from 'react';
import './App.css';
import { range } from 'lodash';

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
  isPencilNote: boolean,
  isOriginal: boolean
}

export default class Board extends React.Component<BoardProps, BoardState> {

  constructor(props: BoardProps) {
    super(props);

    const board = range(this.props.rows).map((row) => {
      return range(this.props.columns).map((column) => {
        const cell: Cell = {
          value: null,
          isPencilNote: false,
          isOriginal: false
        };

        return cell;
      })
    })

    // for testing purposes, will remove later
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
    const isPencilNote = this.state.board[row][column].isPencilNote;
    const isCustom = !this.state.board[row][column].isOriginal;
    const cellValue = this.state.board[row][column].value;

    const classes = [
      'sk-cell',
      isSelected ? 'selected' : '',
      isPencilNote ? 'pencil-note' : '',
      isCustom ? 'custom' : ''
    ].join(' ');

    return (
      <td id={`cell-${row}-${column}`} className={classes}
          key={`cell-${row}-${column}`} data-row={row} data-column={column}
          onClick={(event) => this.clickCell(event)}>
          {cellValue ? cellValue : ''}
      </td>
    );
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
    console.log(`selected cell is ${this.selectedCellId()}`)
    if (this.cellIsSelected()) {
      console.log("cell is selected")
      this.setSelectedCellValue(parseInt(event.target.dataset.number));
    }
  }

  clickPencilModeButton() {
    if (this.state.inPencilNoteMode) {
      this.setState((previousState) => {
        return { ...previousState, inPencilNoteMode: false }
      });
    } else {
      this.setState((previousState) => {
        return { ...previousState, inPencilNoteMode: true }
      });
    }
  }

  clickEraseButton() {
    if (this.cellIsSelected()) {
      this.setSelectedCellValue(null);
    }
  }

  setSelectedCellValue(newValue: NullableNumber) {
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    // TODO: refactor to remove this condition
    if (typeof row === 'number' && typeof column === 'number') {
      if (this.state.board[row][column].isOriginal) return;

      this.setState((previousState) => {
        const newBoard: any = [...previousState.board];

        newBoard[row][column].value = newValue;

        if (this.state.inPencilNoteMode)
          newBoard[row][column].isPencilNote = true;

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
