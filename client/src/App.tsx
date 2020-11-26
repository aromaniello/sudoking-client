import React from 'react';
import Board from './Board'
import './App.css';
import { range } from 'lodash';

type NullableNumber = number | null;

function App() {

  const sampleBoard = () => {
    const board: NullableNumber[][] = range(9).map((row) => {
      return range(9).map((column) => null);
    });

    board[1][2] = 5;
    board[6][3] = 9;
    board[5][7] = 2;

    return board;
  }

  return (
    <div>
      <Board rows={9} columns={9} initialValues={sampleBoard()} />
    </div>
  );
}

export default App;
