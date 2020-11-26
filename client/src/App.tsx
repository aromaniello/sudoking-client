import React from 'react';
import Board from './Board'
import './App.css';

function App() {
  return (
    <div>
      <Board rows={9} columns={9} />
    </div>
  );
}

export default App;
