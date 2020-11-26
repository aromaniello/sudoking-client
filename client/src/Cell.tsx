import React from 'react';
import './Cell.css';

interface CellProps {
  value: number | null,
  row: number,
  column: number,
  pencilNotes: number[],
  isOriginal: boolean,
  isSelected: boolean,
  clickCell: any
}

const Cell = ({ value, row, column, pencilNotes, isOriginal, isSelected, clickCell }: CellProps) => {

  const hasPencilNotes = () => pencilNotes.length > 0;

  const cellClasses = () => {
    return [
      'sk-cell',
      isSelected ? 'selected' : '',
      !isOriginal && !hasPencilNotes() ? 'custom' : '',
      !value && hasPencilNotes ? 'pencil-note' : ''
    ].join(' ');
  }

  const renderPencilNotes = () => {
    return (
      <table>
        <tbody>
          {pencilNoteRow([1, 2, 3])}
          {pencilNoteRow([4, 5, 6])}
          {pencilNoteRow([7, 8, 9])}
        </tbody>
      </table>
    );
  };

  const pencilNoteRow = (values: number[]) => {
    const cells = values.map((pencilNote) => {
      const pencilNoteText: number | string = pencilNotes.includes(pencilNote) ? pencilNote : '';

      return (
        <td className="pencil-note-cell" key={`pencil-note-${row}-${column}-${pencilNote}`}>
          {pencilNoteText}
        </td>
      );
    });

    return (<tr>{cells}</tr>);
  }

  const renderCellContent = () => {
    if (value) {
      return value;

    } else if (hasPencilNotes()) {
      return renderPencilNotes();

    } else {
      return '';
    }
  };

  //TODO: might be able to remove data-row and data-column
  return (
    <td id={`cell-${row}-${column}`} className={cellClasses()}
        key={`cell-${row}-${column}`} data-row={row} data-column={column}
        onClick={(event) => clickCell(event)}>
        {renderCellContent()}
    </td>
  );
};

export default Cell;
