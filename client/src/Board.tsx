import React from 'react';
import './App.css';
import { range } from 'lodash';

interface BoardProps {
  rows: number,
  columns: number
}

// may refactor into functional component
export default class Board extends React.Component<BoardProps> {

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
    return (
      <td id={`cell-${row}-${column}`} className="sk-cell" key={`cell-${row}-${column}`}
          onClick={(event) => this.doClick(event)}>
          1
      </td>
    );
  }

  doClick(event: any) {
    console.log(`Clicked on ${event.target.id}`);
  }

  render() {
    return (
      <div className="sk-board">
        <table>
          <tbody>
            {this.renderBoard()}
          </tbody>
        </table>
      </div>
    );
  }
}
