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

    board[0][4] = 5;
    board[0][8] = 8;
    board[1][2] = 4;
    board[1][3] = 9;
    board[1][6] = 5;
    board[2][0] = 1;
    board[2][4] = 4;
    board[2][6] = 9;
    board[3][3] = 8;
    board[3][5] = 1;
    board[3][8] = 2;
    board[4][4] = 9;
    board[5][6] = 4;
    board[5][7] = 6;
    board[6][1] = 2;
    board[6][7] = 9;
    board[7][0] = 8;
    board[7][1] = 1;
    board[7][4] = 7;
    board[8][0] = 7;
    board[8][1] = 6;
    board[8][3] = 4;
    board[8][5] = 5;
    board[8][7] = 1;

    return board;
  }

  return (
    <div>
      <Board rows={9} columns={9} initialValues={sampleBoard()} />
    </div>
  );
}

export default App;
