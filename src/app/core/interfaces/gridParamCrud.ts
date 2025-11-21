export interface gridParamCrud {
    getUrl: string;
    getUrlParameters?: string;
    key: string;
    keyType: string;
    headerVisible?:boolean,
    reloadEditDataByKey: boolean,
    QuerySelectAll: boolean;
    createUrl: string;
    viewData?: viewData;
    updateUrl: string;
    deleteUrl: string;
    deleteKeyUrl: string;
    rowCountTableUrl?: string;
    getUrlDataByKey?: string;
    pageSize: number;
    pagerVisible?: boolean;
    removeUsingKey: boolean;
    showButtonRefresh: boolean;
    showButtonEdit: boolean;
    showButtonRemove: boolean;
    showButtonNew: boolean;
    expandGrid?: boolean;
    columnsRecords: any[];
    expands?: any[];
    nameForm?: string;
    onValidateSave(data: any, isNew: boolean): any;
    onValidateCancel(data: any, isNew: boolean): boolean;
    onBeforeEdit(data: any, isNew: boolean): void;
}

export interface viewData {
    icon?: string,
    name?: string,
    component(): any,
}

export interface schedulerParamCrud {
    getUrl: string;
    key: string;
    keyType: string;
    keyStatusCatalog: string;
    QuerySelectAll: boolean;
    getUrlByDate: string;
    createUrl: string;
    updateUrl: string;
    deleteKeyUrl: string;
    finishSchedulerUrl: string;
    updateStateSchedulerUrl: string;
    pageSize: number;
    reloadEditDataByKey: boolean;
    showButtonEdit: boolean;
    showButtonRemove: boolean;
    showButtonNew: boolean;
    columnsRecords: any[];
    contextMenuItems: any[];
    onValidateSave(data: any, isNew: boolean): any;
    onValidateCancel(data: any, isNew: boolean): boolean;
    onBeforeEdit(data: any, isNew: boolean): void;
    onChangeStatusScheduler(e: any, dataStatus: any): Promise<void>;
    onFinishScheduler(data: any): Promise<void>
}

