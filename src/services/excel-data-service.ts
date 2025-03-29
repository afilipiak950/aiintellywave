
// This file re-exports functions from the newly created modular files
// to maintain backwards compatibility

export {
  fetchProjectExcelData,
  updateExcelCellData,
  deleteProjectExcelData
} from './excel/excel-data-core';

export {
  exportExcelData
} from './excel/excel-file-processor';

export {
  processExcelFile
} from './excel/excel-lead-processor';
