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
  board: any
}

export default class Board extends React.Component<BoardProps, BoardState> {

  constructor(props: BoardProps) {
    super(props);

    const board = range(this.props.rows).map((row) => {
      return range(this.props.columns).map((column) => {
        return null;
      })
    })

    console.log(board);

    this.state = {
      selectedCell: [null, null],
      board: board
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
    const cellValue = this.state.board[row][column];

    if (isSelected) {
      console.log(`Selected: ${row} ${column}`);
    }

    return (
      <td id={`cell-${row}-${column}`} className={`sk-cell ${isSelected ? 'selected' : ''}`}
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

  selectedCellId() {
    return `cell-${this.state.selectedCell[0]}-${this.state.selectedCell[1]}`;
  }

  cellIsSelected() {
    const row = this.state.selectedCell[0];
    const column = this.state.selectedCell[1];

    return row && row >= 0 && row < this.props.rows &&
           column && column >= 0 && column < this.props.columns;
  }

  clickButton(event: any) {
    if (this.cellIsSelected()) {
      console.log("cell is selected");
      console.log(this.state);
      this.setSelectedCellValue(parseInt(event.target.dataset.number));
    }
  }

  setSelectedCellValue(newValue: number) {
    const row: NullableNumber = this.state.selectedCell[0];
    const column: NullableNumber = this.state.selectedCell[1];

    this.setState((previousState) => {
      const newBoard: any = [...previousState.board];

      // TODO: refactor to remove this condition
      if (typeof row === 'number' && typeof column === 'number') {
        newBoard[row][column] = newValue;
      }

      return { ...previousState, board: newBoard }
    });
  }

  renderButtons() {
    return range(9).map((index) => {
      const number = index + 1;
      const buttonId = `button-${number}`;

      return (
        <button id={buttonId} className="number-button" key={buttonId} data-number={number}
                onClick={(event) => this.clickButton(event)}>
          {number}
        </button>
      );
    });
  }

  render() {
    return (
      <div className="sk-board">
        <table>
          <tbody>
            {this.renderBoard()}
          </tbody>
        </table>
        <div>
          {this.renderButtons()}
        </div>
      </div>
    );
  }
}
