
export const exportTableToCsv = (
  columns: string[],
  rowLabels: string[],
  data: Record<string, Record<string, string>>,
  columnTotals: Record<string, number>,
  rowTotals: Record<string, number>,
  currentYear: number
) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  csvContent += "," + columns.map(col => `${col} '${currentYear}`).join(",") + ",Total\n";
  
  rowLabels.forEach(row => {
    let rowData = row;
    let rowTotal = 0;
    
    columns.forEach(col => {
      const cellValue = data[row][col] || "";
      const numericValue = isNaN(Number(cellValue)) ? 0 : Number(cellValue);
      rowData += "," + numericValue;
      rowTotal += numericValue;
    });
    
    rowData += "," + rowTotal;
    csvContent += rowData + "\n";
  });
  
  let totalRow = "Total";
  let grandTotal = 0;
  
  columns.forEach(col => {
    const colTotal = rowLabels.reduce((sum, row) => {
      const cellValue = data[row][col] || "";
      return sum + (isNaN(Number(cellValue)) ? 0 : Number(cellValue));
    }, 0);
    
    totalRow += "," + colTotal;
    grandTotal += colTotal;
  });
  
  totalRow += "," + grandTotal;
  csvContent += totalRow + "\n";
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "excel_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
