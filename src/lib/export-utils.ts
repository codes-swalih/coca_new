/**
 * Export utilities for generating CSV files
 */

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => string);
}

/**
 * Convert data array to CSV string
 */
export function convertToCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  const rows = data.map(item => {
    return columns.map(col => {
      let value: string;
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        value = String(item[col.accessor] ?? '');
      }
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  const csv = convertToCSV(data, columns);
  downloadCSV(csv, filename);
}
