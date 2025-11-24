import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, EnvironmentInjector, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Signal, TemplateRef, effect, inject, model, output, runInInjectionContext, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DxButtonGroupModule, DxButtonModule, DxDataGridComponent, DxDataGridModule, DxDropDownButtonModule,
  DxFormModule, DxLoadPanelModule, DxResizableModule, DxSelectBoxModule,
  DxToolbarComponent, DxToolbarModule
} from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { LoadOptions } from 'devextreme/data';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import ODataStore from 'devextreme/data/odata/store';
import dxForm from 'devextreme/ui/form';
import _ from 'lodash';
import { Subject, catchError, exhaustMap, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { gridParamCrud } from '../../../core/interfaces/gridParamCrud';
import { GeneralService } from '../../../core/services/general.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { TabServiceService } from '../../../core/services/tab.service';
import { changeStatusEditButton } from '../../shared/options';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { Dispatch, GenerateOptionsMenu, basicRulesetToODataFilter, convertOData } from './options';

@Component({
    selector: 'app-grid-crud',
    standalone: true,
    imports: [DxDataGridModule, DxResizableModule, DxToolbarModule, DxButtonModule, DxDropDownButtonModule, DxSelectBoxModule, DxButtonGroupModule, DxFormModule,
        CommonModule, DxLoadPanelModule, SkeletonComponent, DxDropDownButtonModule],
    templateUrl: './grid-crud.component.html',
    styleUrl: './grid-crud.component.scss'
})
export default class GridCrudComponent implements OnInit, OnDestroy {
    toolbarEdit: Signal<DxToolbarComponent | undefined> = viewChild('toolbarEdit');
    toolbarGrid: Signal<DxToolbarComponent | undefined> = viewChild('toolbarGrid');
    dataGrid: Signal<DxDataGridComponent | undefined> = viewChild(DxDataGridComponent);

    @Input() openEditNewTab?: boolean;
    @Input() isReadOnly: boolean = false;
    @Input({ required: true }) gridParamCrud!: gridParamCrud;
    @Input() editFormsTemplate?: TemplateRef<any>;
    @Input() customFunctionExport?: (filter: any, resolve: any, reject: any) => void;
    @Output() onInitRowGrid = new EventEmitter();
    @Output() onEditorPreparingRowGrid = new EventEmitter();
    @Output() onInitializedDatagrid = new EventEmitter();
    @Output() onRowPreparedDatagrid = new EventEmitter();
    @Output() onCellClickDatagrid = new EventEmitter();

    form?: dxForm;
    summary: any = {};
    selectedRecord: any;
    pageIndex: number = 0;
    dataSource?: DataSource;
    loadingVisible: boolean = false;
    NoPageComponent = model<number>(-10);
    disabledCancelEdit: boolean = false;
    loadingVisibleExport: boolean = false;
    customQueryDatasource?: any[];
    customQuery = model<any | undefined>(undefined)
    toolbarEditEvent = output<DxToolbarComponent>();
    toolbarGridEvent = output<DxToolbarComponent>();
    customArrayDatasource = model<any[] | undefined>(undefined);

    private odataStore?: ODataStore;
    private target: any;
    private scrollTop: number = 0;
    private returnPage?: boolean;
    private nameTab: string = '';
    private serviceUrl: string = '';
    private controllerUrl: string = '';
    private filterDatagrid: string = '';
    private isNewElement: boolean = false;
    private service = inject(GeneralService);
    private tabService = inject(TabServiceService);
    private observer: IntersectionObserver | undefined;
    private notifications = inject(NotificacionesService);
    private readonly injector = inject(EnvironmentInjector);
    private searchByID$: Subject<[string, HttpParams]> = new Subject<[string, HttpParams]>();

    heightGrid: string = '75';
    showGrid: boolean = true;
    fullScreen: boolean = false;
    buttonsAction = {
        type: 'buttons',
        buttons: [
            {
                icon: 'edit',
                name: 'edit',
                visible: false,
                onClick: (e: DxDataGridTypes.ColumnButtonClickEvent) => {
                    e.event?.preventDefault;
                    this.scrollTop = this.dataGrid()?.instance.getScrollable().scrollOffset();

                    if (this.openEditNewTab) {
                        const isTitle = this.gridParamCrud.columnsRecords.find(row => row.isTitleTab);
                        const dataKey = e.row?.data[this.gridParamCrud.key];

                        this.tabService.tabItemObservable.next({
                            code: this.nameTab + '-' + dataKey,
                            icon: this.gridParamCrud.viewData?.icon ?? '',
                            label: (this.gridParamCrud.viewData?.name ?? (isTitle === undefined ? this.nameTab : e.row?.data[isTitle.dataField])) + ' *--* ' + dataKey,
                            canClose: true,
                            refreshButton: () => { setTimeout(() => this.dataSource?.reload(), 500) },
                            routerLink: this.gridParamCrud.viewData?.component ?? (() => this.nameTab)
                        });

                        return
                    }

                    this.setEditDataGrid(e.row?.data);
                }
            },
            {
                icon: 'trash',
                name: 'delete',
                onClick: (e: DxDataGridTypes.ColumnButtonClickEvent) => {
                    e.event?.preventDefault;
                    this.dataGrid()!.instance.deleteRow(e.row?.rowIndex!);
                }
            }
        ]
    };

    constructor(@Inject(DOCUMENT) private document: Document) {
        GenerateOptionsMenu();

        effect(() => {
            if (this.customArrayDatasource() !== undefined) {
                if (Array.isArray(this.customQuery()))
                    this.customQueryDatasource = _.cloneDeep(this.customQuery());

                this.dataSource = new DataSource({
                    store: new ArrayStore({
                        key: this.gridParamCrud.key === '' ? undefined : this.gridParamCrud.key,
                        data: this.customArrayDatasource(),
                        onUpdated: (key, values) => {
                            const data: any = this.gridParamCrud.key === '' ? values : this.customArrayDatasource()!.find(row => row[this.gridParamCrud.key] === key);

                            if ((data?.action ?? '') === '')
                                data.action = 'upd';
                        },
                        onRemoved: (key) => {
                            if (this.gridParamCrud.key === '') {
                                if ((key?.action ?? '') === '')
                                    this.customArrayDatasource()?.push({ ...key, action: 'del' });
                            } else
                                if (key !== undefined && key !== null && key.constructor !== Object) {
                                    if (key !== -1)
                                        this.customArrayDatasource()?.push({ [this.gridParamCrud.key]: key, action: 'del' });
                                }
                        },
                        onInserted: (values, key) => {
                            values[this.gridParamCrud.key] = -1
                            values.action = 'ins';
                        },
                        errorHandler: (error: { message: any; }) => {
                            this.notifications.showMessage(error.message, 'error');
                        }
                    }),
                    reshapeOnPush: true,
                    sort: this.gridParamCrud.columnsRecords.filter(row => row.sort)
                        .map(content => ({ selector: content.dataField, desc: content.desc })),
                    filter: this.customQueryDatasource ?? ["!", ["action", "contains", "del"]],
                });
            }
        });

        effect(() => {
            if (this.NoPageComponent() === 1 && this.nameTab === '' && this.gridParamCrud.showButtonNew)
                this.NoPageComponent.set(0);

            if (this.NoPageComponent() === 0) {
                if (this.selectedRecord !== undefined) {
                    if (this.selectedRecord[this.gridParamCrud.key] !== undefined) {
                        this.gridParamCrud.reloadEditDataByKey = true;
                        this.setEditDataGrid(this.selectedRecord);
                        this.NoPageComponent.set(2);
                    }
                }
            } else if (this.NoPageComponent() === -1)
                setTimeout(() => {
                    this.NoPageComponent.set(1);
                    this.onButtonClick('refresh');
                }, 50);
            else if (this.NoPageComponent() === -2)
                if (!this.loadingVisibleExport) {
                    setTimeout(() => {
                        this.NoPageComponent.set(1);
                        this.onButtonClick('exportxlsx');
                    }, 50);
                } else
                    this.notifications.showMessage('Espere mientras finaliza la exportación actual', 'error');

        }, { allowSignalWrites: true });

        effect(() => {
            this.toolbarEditEvent.emit(this.toolbarEdit()!);
        });

        effect(() => {
            this.toolbarGridEvent.emit(this.toolbarGrid()!);
        });

        this.searchByID$.pipe(
            exhaustMap(([url, params]) => this.service.GetODATA(url, params)),
            takeUntilDestroyed(),
            catchError((error, originalObs) => {
                let message = error.message;
                if (error.error?.Message !== undefined)
                    message = error.error.Message + ' - ' + message;

                if (this.returnPage && !this.openEditNewTab)
                    this.NoPageComponent.set(1);

                this.selectedRecord = undefined;
                this.notifications.showMessage(message, 'error');

                return originalObs;
            })
        ).subscribe({
            next: (responseGridCrud: any) => {
                let response: any
                if (Array.isArray(responseGridCrud))
                    [response] = responseGridCrud;
                else
                    response = responseGridCrud;
                // const response = responseGridCrud;
                if (response === undefined)
                    throw new Error('Registro no encontrado favor verificar');

                Object.assign(this.selectedRecord, response);
                this.gridParamCrud.onBeforeEdit(this.selectedRecord, this.isNewElement);
                this.loadingVisible = false;
            }
        });
    }

    ngOnInit(): void {
        this.setOpenEditNewTab();

        setTimeout(() => {
            if (this.customArrayDatasource() === undefined || (this.customArrayDatasource() !== undefined && !this.gridParamCrud.reloadEditDataByKey)) {
                this.processCustomQuery();

                [this.controllerUrl] = this.gridParamCrud.getUrl.split("/");
                if (this.shouldHandleTabNavigation() && this.gridParamCrud.key !== '') {
                    this.handleTabNavigation();

                    return;
                };

                const [existColumnButton] = this.gridParamCrud.columnsRecords.filter(row => row.type === 'buttons');
                if (existColumnButton)
                    if (existColumnButton?.buttons && !(existColumnButton?.isCustomize ?? true))
                        this.gridParamCrud.columnsRecords.shift();

                this.serviceUrl = environment.apiUrl + this.gridParamCrud.getUrl;
                this.buttonsAction.buttons[0].visible = this.gridParamCrud.showButtonEdit;
                this.buttonsAction.buttons[1].visible = this.gridParamCrud.showButtonRemove;

                if (this.gridParamCrud.showButtonEdit || this.gridParamCrud.showButtonRemove) {
                    this.configureActionButtons(existColumnButton);
                    this.gridParamCrud.columnsRecords = [this.buttonsAction, ...this.gridParamCrud.columnsRecords];
                } else
                    this.gridParamCrud.columnsRecords = this.gridParamCrud.columnsRecords;

                if (this.customArrayDatasource() === undefined)
                    this.setupDataSource();

                this.setupIntersectionObserver();
            }

            this.showGrid = true;
            this.configureSummary();
            this.setupInjectContext()
        }, 0);
    }

    private setOpenEditNewTab(): void {
        if (this.openEditNewTab === undefined)
            this.openEditNewTab = ((this.gridParamCrud.createUrl !== '' && this.gridParamCrud.updateUrl !== '')
                || this.gridParamCrud.reloadEditDataByKey || (this.gridParamCrud.viewData != null));
    }

    private processCustomQuery(): void {
        if (Array.isArray(this.customQuery())) {
            this.customQueryDatasource = _.cloneDeep(this.customQuery());
            this.customQuery.set(undefined);
        };

        if (typeof this.customQuery() === 'string') {
            this.filterDatagrid = this.customQuery();
            this.customQuery.set(undefined);
        }
    }

    private shouldHandleTabNavigation(): boolean {
        const elementTab = this.document.getElementsByClassName('p-element p-tabmenuitem p-highlight ng-star-inserted');
        if (elementTab.length === 0) return false;

        this.nameTab = (elementTab[0] as any).getElementsByClassName('p-menuitem-link')[0].dataset.fulllabel;
        return ((this.nameTab.includes('-') && this.gridParamCrud.showButtonNew) ||
            (this.nameTab.includes(' *--* ') && this.gridParamCrud.showButtonEdit && this.openEditNewTab)) ?? false
    }

    private handleTabNavigation(): void {
        if (this.nameTab.includes(' *--* ')) {
            this.disabledCancelEdit = true;
            this.dataSource = new DataSource({
                load: () => Promise.resolve(this.handleErrorSearch(null)),
                insert: (values: any) => this.getFunctionInsertUpdate().insert(values),
                update: (key: any, values: any) => this.getFunctionInsertUpdate().update(key, values)
            });
        } else {
            this.gridParamCrud.showButtonNew = false;
            this.gridParamCrud.showButtonRefresh = this.gridParamCrud.showButtonNew;
        }

        const [_, dataKey] = this.nameTab.includes(' *--* ') ? this.nameTab.split(' *--* ') : this.nameTab.split('-');
        const keyTemp = this.gridParamCrud.key[0].toLowerCase() + this.gridParamCrud.key.slice(1);
        const selectedRecord: any = { [keyTemp]: dataKey };
        this.setEditDataGrid(selectedRecord, false);
    }

    private configureActionButtons(existColumnButton: any): void {
        if (existColumnButton) {
            existColumnButton?.buttons.forEach((element: any) => {
                if (typeof element === 'object') {
                    if ((element.onClick ?? false) && (element.isBlocking ?? false)) {
                        const elementOverride = {
                            ...element, onClick: (e: any, editForm: boolean = false) => {
                                this.showLoadingGrid(true, editForm)
                                this.notifications
                                    .dialogConfirm(`¿Está seguro que desea volver a ejecutar el proceso?`, 'Confirmación').then(async (dialogResult) => {
                                        if (dialogResult)
                                            element.onClick instanceof Promise ? await element.onClick(e) : element.onClick(e);
                                        else
                                            this.showLoadingGrid(false, editForm)
                                    });
                            }
                        }

                        this.buttonsAction.buttons = [...this.buttonsAction.buttons, elementOverride];
                    }
                }
            });

            this.gridParamCrud.columnsRecords.shift();
        }
    }

    private getFunctionInsertUpdate() {
        return {
            insert: (values: any) => firstValueFrom(this.service.Post(this.controllerUrl, this.gridParamCrud.createUrl.slice(1), values, undefined, false))
                .then((value) => value)
                .catch((exception) => { this.notifications.showMessage(this.service.handleMessageError(exception), 'error'); throw exception }),
            update: (key: any, values: any) => firstValueFrom(this.service.Put(this.controllerUrl, this.gridParamCrud.updateUrl.slice(1), values, undefined, false))
                .then((value) => value)
                .catch((exception) => { this.notifications.showMessage(this.service.handleMessageError(exception), 'error'); throw exception }), //console.log(exception); throw new Error(exception?.Message !== undefined ? exception : exception.error?.Message !== undefined ? `{"errors": "${exception.error.Message.split('@@@')[0].replaceAll("'", '').replaceAll('"', '').replaceAll('`', '')}"}` : exception) }),
        };
    }

    private createODataStore() {
        this.odataStore = new ODataStore({
            url: this.serviceUrl,
            key: this.gridParamCrud.key,
            keyType: this.gridParamCrud.keyType,
            // filterToLower: false,
            beforeSend: (e) => {
                if (e.params.$orderby !== undefined) {
                    let orderby = '';
                    e.params.$orderby.split(",").forEach((item: string) => {
                        if (orderby !== '') orderby += ',';
                        orderby += item[0].toUpperCase() + item.slice(1);
                    });

                    e.params.$orderby = orderby;
                }

                e.url += this.gridParamCrud.getUrlParameters ?? '';

                const httpOptions = this.service.getHTTPOptionsDefaults();
                e.headers["pragma"] = httpOptions.get('pragma');
                e.headers["cache-control"] = httpOptions.get('cache-control');
                e.headers["Expires"] = httpOptions.get('Expires');
                e.headers["Content-Encoding"] = httpOptions.get('Content-Encoding');
                e.headers["Content-Type"] = httpOptions.get('Content-Type');
                e.headers["X-Tenant-Pais"] = httpOptions.get('X-Tenant-Pais');
                e.headers.Authorization = httpOptions.get('Authorization');
                e.headers["SMLV3"] = httpOptions.get('SMLV3');
                e.headers["SMLV4"] = httpOptions.get('SMLV4');

                if (this.filterDatagrid !== '')
                    e.params.$filter = (e.params.$filter === undefined ? '' : e.params.$filter + ' and ') + this.filterDatagrid;
            }
        });
    }

    private setupDataSource(): void {
        this.settingEditDataDefault();
        this.createODataStore();
        this.dataSource = new DataSource({
            byKey: (key) => this.odataStore!.byKey(key),
            load: (options: LoadOptions) => {
                let resolve: any, reject;
                const dsPromise = new Promise((res, rej) => {
                    resolve = res;
                    reject = rej;
                });

                if (!this.gridParamCrud.showButtonRefresh && this.customQueryDatasource === undefined) {
                    if (this.filterDatagrid === '')
                        resolve(this.handleErrorSearch(null));
                    else
                        this.odataStore!.load(options).then((value) => {
                            const dataResult = (value as any);
                            if (!dataResult.success)
                                throw new Error(dataResult.message);

                            resolve({
                                data: dataResult.result?.value,
                                totalCount: dataResult.result?.totalCount,
                                summary: 0,
                                groupCount: 0
                            });
                        }
                        ).catch((error) => {
                            resolve(this.handleErrorSearch(error));
                        });

                } else {
                    let allPromises;
                    if (this.gridParamCrud.rowCountTableUrl) {
                        let totalPromise: Promise<any>;
                        const filters = options['filter'];
                        if ((this.customQueryDatasource ?? []).length > 0)
                            totalPromise = this.service.GetFecth(this.controllerUrl,
                                this.gridParamCrud.rowCountTableUrl.slice(1), new HttpParams({ fromString: `${this.customQueryDatasource![0]}=${this.customQueryDatasource![2]}` }));
                        else {
                            let queryFilter: string | null = null;
                            if (filters !== undefined) {
                                queryFilter = "filter=";
                                if (Array.isArray(filters[0])) {
                                    filters.forEach((item: any) => {
                                        if (Array.isArray(item[0]))
                                            queryFilter += convertOData(item[0][0], item[0][1], item[0][2]);
                                        else if (Array.isArray(item))
                                            queryFilter += convertOData(item[0], item[1], item[2]);
                                        else
                                            queryFilter += " " + item + " ";
                                    })
                                } else
                                    queryFilter += convertOData(filters[0], filters[1], filters[2]);

                                queryFilter += (this.filterDatagrid !== '' ? ' and ' + this.filterDatagrid : '');
                            } else if (this.filterDatagrid !== '')
                                queryFilter = "filter=" + this.filterDatagrid

                            queryFilter ??= this.gridParamCrud.getUrlParameters ?? null;
                            totalPromise = this.service.GetFecth(this.controllerUrl, this.gridParamCrud.rowCountTableUrl.slice(1),
                                queryFilter ? new HttpParams({ fromString: queryFilter }) : undefined);
                        }

                        allPromises = Promise.all([this.odataStore!.load(options), totalPromise]);
                    } else
                        allPromises = Promise.all([this.odataStore!.load(options), null]);

                    allPromises.then(([data, count]) => {
                        const dataResult = (data as any);
                        if (!dataResult.success)
                            throw new Error(dataResult.message);

                        const result = dataResult.result;
                        let valueDataRows = result?.value ?? result;
                        let totalCount = result?.totalCount ?? count;

                        if (valueDataRows.length == 0)
                            totalCount = 0;

                        resolve({
                            data: valueDataRows,
                            totalCount: totalCount,
                            summary: 0,
                            groupCount: 0
                        });
                    }).catch(error => {
                        resolve(this.handleErrorSearch(error));
                    })
                }

                return dsPromise;
            },
            ...this.getFunctionInsertUpdate(),
            remove: async (values) => {
                let actionPromise: Promise<any>;
                if (this.gridParamCrud.removeUsingKey)
                    actionPromise = firstValueFrom(this.service.Delete(this.controllerUrl, `${this.gridParamCrud.deleteKeyUrl.slice(1)}/${values[this.gridParamCrud.key]}`));
                else
                    actionPromise = firstValueFrom(this.service.Delete(this.controllerUrl, this.gridParamCrud.deleteUrl.slice(1), undefined, values));

                try {
                    const value: any = await actionPromise;
                    this.notifications.showMessage(value?.message ?? 'Registro eliminado satisfactoriamente', 'success');
                } catch (exception: any) {
                    let message = exception?.error?.Message ?? exception;
                    this.notifications.showMessage(message, 'error');
                }
            },
            // group: [{ selector: "LocationId", desc: false }]  ,
            select: this.gridParamCrud.QuerySelectAll ? [] :
                this.gridParamCrud.columnsRecords.filter(row => ((row?.allowInQuery ?? true) == true) && row.type !== 'buttons')
                    .map(content => (content.dataField)),
            sort: this.gridParamCrud.columnsRecords.filter(row => row.sort)
                .map(content => ({ selector: content.dataField, desc: content.desc })),
            filter: this.customQueryDatasource
        });
    }


    private configureSummary(): void {
        let summaryData = this.gridParamCrud.columnsRecords.filter(row => row?.summaryType !== undefined)
            .map(content => ({
                name: content.dataField + content.summaryType,
                column: content.dataField,
                valueFormat: content.format,
                summaryType: content.summaryType,
                displayFormat: "Σ {0}"
            }));

        this.summary = {};
        if (summaryData.length !== 0) {
            this.summary = {
                totalItems: summaryData,
                skipEmptyValues: false
            }
        }
    }

    private setupInjectContext(): void {
        if (!this.gridParamCrud.showButtonNew) {
            runInInjectionContext(this.injector, () => {
                effect(() => {
                    let query: any = this.customQuery();
                    if (query ?? false) {
                        if (query.condition !== undefined) {
                            let filterDatagridTemp = basicRulesetToODataFilter(query);
                            if (this.filterDatagrid !== '')
                                this.dataSource?.reload();

                            this.filterDatagrid = filterDatagridTemp;
                        }
                    }
                });
            });
        };

        if (!this.disabledCancelEdit) this.NoPageComponent.set(1);
    }

    private setEditDataGrid(data: any, returnPage: boolean = true) {
        if (this.editFormsTemplate || this.gridParamCrud.updateUrl !== '')
            this.NoPageComponent.set(2);

        this.isNewElement = false;
        this.selectedRecord = data;
        this.gridParamCrud.reloadEditDataByKey ? this.refreshDataGrid(returnPage) : this.gridParamCrud.onBeforeEdit(this.selectedRecord, this.isNewElement);

        //Si no tiene un custom edit entonces carga el default
        // if (!this.gridParamCrud.reloadEditDataByKey && Object.keys(this.selectedRecord).length === 1 && this.gridParamCrud.updateUrl !== '' && this.gridParamCrud.createUrl !== '')
        //     this.refreshDataGrid(returnPage)

        if (returnPage || this.nameTab.includes(' *--* '))
            this.settingFormInstance();
        else if (!this.nameTab.includes(' *--* '))
            this.settingFormInstance().then((data) => { this.form?.option('readOnly', true); });
    }

    private settingFormInstance(): Promise<boolean> {
        if (this.form !== undefined) return Promise.resolve(true);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const nameForm = this.gridParamCrud.nameForm ?? 'formEdit';
                const element = document.getElementById(nameForm);
                if (element)
                    this.form = dxForm.getInstance(element!) as dxForm;

                resolve(true);
            }, 1000);
        });
    }

    private setupIntersectionObserver(): void {
        //observar si el grid está cargado en el viewport para refrescar la caché
        setTimeout(() => {
            this.target = document.getElementById("divVisible");
            if (this.target) {
                this.observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting)
                            this.handleGridVisibility();
                    });
                }, { root: null, threshold: 0 });

                this.observer.observe(this.target);
            }
        }, 1000);
    }

    private handleGridVisibility(): void {
        this.settingEditDataDefault();

        if (this.pageIndex != 0)
            this.dataGrid()?.instance?.pageIndex(this.pageIndex - 1)
                .then((data) => this.dataGrid()?.instance?.pageIndex(this.pageIndex + 1));
        else if (this.scrollTop != 0) //if (!this.gridParamCrud.showButtonRefresh)
            this.dataGrid()?.instance?.getScrollable()?.scrollTo(this.scrollTop);
    }

    private settingEditDataDefault() {
        const [columnKey] = this.gridParamCrud.columnsRecords.filter(row => row.dataField === this.gridParamCrud.key);
        if (columnKey !== undefined) {
            if (columnKey?.dataLoadDefault !== undefined) {
                const keyTemp = this.gridParamCrud.key[0].toLowerCase() + this.gridParamCrud.key.slice(1);
                const selectedRecord: any = { [keyTemp]: columnKey.dataLoadDefault };
                this.gridParamCrud.reloadEditDataByKey = true;
                this.disabledCancelEdit = true;
                this.setEditDataGrid(selectedRecord);

                delete columnKey.dataLoadDefault;
            }
        }
    }

    private refreshDataGrid(returnPage: boolean = true) {
        setTimeout(() => {
            this.loadingVisible = true;
            this.returnPage = returnPage;

            let params: HttpParams;
            let url: string;
            const keyTemp = this.gridParamCrud.key[0].toLowerCase() + this.gridParamCrud.key.slice(1);
            if (!this.gridParamCrud.getUrlDataByKey) {
                url = this.gridParamCrud.getUrl;
                params = new HttpParams({
                    fromString: `$filter=${keyTemp} eq ${this.selectedRecord[keyTemp]}` +
                        (this.filterDatagrid !== '' ? ' and ' + this.filterDatagrid : '') +
                        (this.gridParamCrud.expands ? '&$expand=' + this.gridParamCrud.expands : '')
                });
            } else {
                url = this.gridParamCrud.getUrl + this.gridParamCrud.getUrlDataByKey;
                params = new HttpParams({
                    fromString: `${keyTemp}=${this.selectedRecord[keyTemp]}`
                });
            }

            this.searchByID$.next([url, params]);
        }, 10);
    }

    private handleErrorSearch(error: any) {
        if (error ?? false)
            this.notifications.showMessage(this.service.handleMessageError(error), 'error');

        return {
            data: [],
            totalCount: 0,
            summary: 0,
            groupCount: 0
        };
    }

    async onButtonClick(event: any, eventAfterAction: any = null, showMessage: boolean = true) {
        Dispatch.call(this, event, this.dataGrid()?.instance, eventAfterAction, showMessage);
    }

    async changeEditingValuesGrid(values: { allowAdding?: boolean, allowUpdating?: boolean, allowDeleting?: boolean, visibleButtonCrud?: boolean }) {
        const instance = this.dataGrid()?.instance;
        instance?.option("editing.mode", "row");
        instance?.option("editing.allowAdding", values?.allowAdding ?? false);
        instance?.option("editing.allowUpdating", values?.allowUpdating ?? false);
        instance?.option("editing.allowDeleting", values?.allowDeleting ?? false);
        if (this.gridParamCrud.columnsRecords[0]?.isCustomize !== true)
            instance?.columnOption(0, 'visible', values?.visibleButtonCrud ?? false);

        await instance?.getDataSource()?.reload();
    }

    changeStatusEditButton() {
        changeStatusEditButton(this.toolbarEdit()?.instance);
    }

    onClickButtonOptions() {
        this.dataGrid()?.instance.addRow();
        this.dataGrid()?.instance.deselectAll();
    }

    onClickButtonFullScreen(event: any) {
        this.fullScreen = !this.fullScreen;
        const elementGrid = this.dataGrid()?.instance.element() as any;

        if (!this.fullScreen)
            this.setHeightGrid(elementGrid);
        else
            elementGrid.style.height = "82dvh";
    }

    showLoadingGrid(loadVisible: boolean, editForm: boolean = false) {
        if (editForm)
            this.loadingVisible = loadVisible ?? false
        else
            this.loadingVisibleExport = loadVisible ?? false;
    }

    processEventEditToolbar(data: any[]) {
        const items = this.toolbarEdit()?.instance.option('items')!;

        data.forEach((element: any) => {
            if (element?.menuItemTemplate === "menuSeparatorTemplate")
                items.push(element);
            else
                items.push({
                    options: {
                        icon: element.icon,
                        hint: element.hint,
                        validation: () => { return element.validation !== undefined ? element.validation() : true; },
                        visible: element.validation !== undefined ? element.validation() : true,
                        onClick: element.onClick,
                    },
                    widget: 'dxButton',
                });
        });
    }

    onRowUpdating(options: any) {
        if (!this.gridParamCrud.showButtonRefresh)
            options.newData = Object.assign(options.oldData, options.newData);
    }

    onInitNewRow(e: any) {
        this.onInitRowGrid.emit(e);
    }

    onEditorPreparing(e: any) {
        this.onEditorPreparingRowGrid.emit(e);
    }

    onInitialized(e: any) {
        e.element.style['min-height'] = "300px";
        this.setHeightGrid(e.element);

        setTimeout(async () => {
            const instance = e.component;
            const editMode: string = instance?.option("editing.mode") as string;
            if (editMode === 'cell' && this.gridParamCrud.key === '') {
                e.element.style['min-height'] = "unset";
                await this.changeEditingValuesGrid({
                    allowDeleting: !this.isReadOnly,
                    allowUpdating: !this.isReadOnly,
                    visibleButtonCrud: !this.isReadOnly
                });
            }
        }, 1000);

        this.onInitializedDatagrid.emit(e);
    }

    private setHeightGrid(element: any) {
        const heightGridParent: string = element.parentNode.parentNode.parentNode.style.height;
        const heightGridParentNumber: number = +heightGridParent.replace(/[^0-9]+/g, "") - 1;
        if (heightGridParentNumber !== -1 && heightGridParent.endsWith('dvh'))
            element.style.height = heightGridParentNumber + "dvh";
    }

    onRowPrepared(e: any) {
        this.onRowPreparedDatagrid.emit(e);
    }

    onCellClick(e: any) {
        this.onCellClickDatagrid.emit(e);
    }

    ngOnDestroy(): void {
        this.observer?.unobserve(this.target);
        this.observer?.disconnect();
        this.observer = undefined;

        this.odataStore = undefined;
        this.dataSource?.dispose();
        this.dataSource = undefined;
        this.dataGrid()?.instance.dispose();
    }
}
