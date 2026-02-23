import ExcelJS = require('exceljs');
export type SpreadsheetColumn = {
    key: string;
    label: string;
    required?: boolean;
};
export declare const DEFAULT_SPREADSHEET_COLUMNS: SpreadsheetColumn[];
export declare function pickValue(row: Record<string, unknown>, key: string): unknown;
export declare function toCsv(columns: SpreadsheetColumn[], rows: Array<Record<string, unknown>>): string;
export declare function toXlsx(columns: SpreadsheetColumn[], rows: Array<Record<string, unknown>>): Promise<Buffer<ExcelJS.Buffer>>;
export declare function buildCartorioZip(params: {
    naming: {
        familyFolder: string;
        spreadsheetFolder: string;
        titlesFolder: string;
        approvedDocumentsFolder: string;
    };
    spreadsheetFileName: string;
    spreadsheetBuffer: Buffer;
    familyRows: Array<Record<string, unknown>>;
    approvedDocuments: Array<{
        fileName: string;
        content: Buffer;
        nucleus?: string;
    }>;
}): Promise<Buffer<ArrayBufferLike>>;
export declare function sha256Hex(payload: Buffer | string): string;
