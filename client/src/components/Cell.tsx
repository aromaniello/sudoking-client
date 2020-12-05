import React from 'react';
import '../stylesheets/Cell.css';

interface CellProps {
  value: number | null,
  row: number,
  column: number,
  pencilNotes: number[],
  isOriginal: boolean,
  isSelected: boolean,
  hasError: boolean,
  clickCell: any
}

const Cell = ({ value, row, column, pencilNotes, isOriginal, isSelected, hasError, clickCell }: CellProps) => {

  const isCustom     = () => !isOriginal && pencilNotes.length === 0 && !hasError;
  const isPencilNote = () => !value && pencilNotes.length > 0;
  const showError    = () => hasError && !isOriginal;

  const cellClasses = () => {
    return [
      'sk-cell',
      isSelected ? 'selected' : '',
      showError() ? 'error' : '',
      isCustom() ? 'custom' : '',
      isPencilNote() ? 'pencil-note' : '',
      hasGrayBackground() ? 'gray-background' : ''
    ].join(' ').replace(/\s+/g, ' ');
  };

  const hasGrayBackground = () => {
    return (row <= 2 && column <= 2) ||                            // nw quadrant
           (row <= 2 && column >= 6) ||                            // ne quadrant
           (row >= 3 && row <= 5 && column >= 3 && column <= 5) || // center quadrant
           (row >= 6 && column <= 2) ||                            // sw quadrant
           (row >= 6 && column >= 6);                              // se quadrant
  };

  const renderPencilNotes = () => {
    return (
      <table className="pencil-notes-table">
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
      const cellKey = `pencil-note-${row}-${column}-${pencilNote}`;

      return (
        <td className="pencil-note-cell"
            data-row={row}
            data-column={column}
            key={cellKey}
            onClick={(event) => clickCell(event)}>
          {pencilNoteText}
        </td>
      );
    });

    return (<tr>{cells}</tr>);
  }

  const renderCellContent = () => {
    if (value) {
      return value;

    } else if (pencilNotes.length > 0) {
      return renderPencilNotes();

    } else {
      return '';
    }
  };

  return (
    <td id={`cell-${row}-${column}`} className={cellClasses()}
        key={`cell-${row}-${column}`} data-row={row} data-column={column}
        onClick={(event) => clickCell(event)}>
        {renderCellContent()}
    </td>
  );
};

export default Cell;
