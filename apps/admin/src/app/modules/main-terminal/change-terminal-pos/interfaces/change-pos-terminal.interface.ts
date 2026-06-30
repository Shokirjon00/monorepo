export interface IChangePosTerminal {
    id: string,
    companyId: string,
    terminalStatusName: string,
    terminalId: string,
    posTypeName: string,
    companyName: string,
    merchantName: string,
    posName: string,
    merchantAddress: string,
    createdAt: string,
    segmentName: string
}

export interface IInfoRow {
    key?: string;
    value?: string | null | undefined;
    field?: keyof IChangePosTerminalInfo;
    isDate?: boolean;
}

export interface IChangePosTerminalInfo extends IChangePosTerminal {
    terminalModelName: string;
    inventoryNumber: string;
    terminalSerialNumber: string;
    simPos: string;
    ownerName: string;
    managerName: string;
    businessManagerName: string;
    letterDate: string;
    offerDate: string;
    installationActDate: string;
    removalActDate: string;
    installationActNumber: string;
    removalActNumber: string;
}

export interface IChangePosTerminalUpdate {
    id: string;
    terminalStatusId: string;
    simPos: string;
    segmentId: string;
    terminalModelId: string;
    ownerName: string;
    managerId: string;
    businessManagerId: string;
    letterDate: string;
    offerDate: string;
    installationActDate: string;
    removalActDate: string;
    installationActNumber: string;
    removalActNumber: string;
    terminalStatusName?: string;
    terminalId?: string;
    posTypeName?: string;
    companyName?: string;
    merchantName?: string;
    posName?: string;
    merchantAddress?: string;
    createdAt?: string;
    terminalSerialNumber?: string;
}

export interface INotFoundTid {
    rowNumber: number;
    tid: string;
}

export interface IImportExcelResult {
    createdCount: number;
    closedCount: number;
    notFoundTids: INotFoundTid[];
}
