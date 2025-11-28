import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, Input, model, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxLoadPanelModule, DxPopupModule, DxResizableModule, DxSelectBoxModule, DxTemplateModule, DxToolbarComponent, DxToolbarModule } from 'devextreme-angular';
import _ from 'lodash';
import { NgxExtendedPdfViewerModule, NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';
import { ListboxModule } from 'primeng/listbox';
import { catchError, exhaustMap, forkJoin, Subject, tap } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import { NotificacionesService } from 'src/app/core/services/notificaciones.service';
import { generateUUID } from 'src/app/modules/shared/options';
import { SkeletonComponent } from 'src/app/modules/shared/skeleton/skeleton.component';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { CotizacionesDetalleComponent } from './cotizaciones-detalle/cotizaciones-detalle.component';

interface TipoMensaje {
  name: string,
  code: string
}

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, DxTemplateModule, CotizacionesDetalleComponent,
    DxSelectBoxModule, DxCheckBoxModule, SkeletonComponent, DxSelectBoxModule, NgxExtendedPdfViewerModule, DxLoadPanelModule,
    DxPopupModule, DxToolbarModule, DxResizableModule, MatIconModule, ListboxModule, FormsModule],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.scss'
})
export default class CotizacionesComponent implements OnChanges {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;

  @Input() hojaIngresoId: number = 0;
  indexTab = model<number>(4);

  loadingVisibleReporte: boolean = false;
  popupVisibleReporte: boolean = false;
  loadingData: boolean = false;
  readonly: boolean = false;
  parametros: gridParamCrud = {
    getUrl: 'Cotizaciones',
    key: 'cotizacionId',
    keyType: 'Int32',
    QuerySelectAll: false,
    pageSize: 20,
    autowidth: false,
    removeUsingKey: true,
    reloadEditDataByKey: true,
    showButtonRefresh: true,
    showButtonEdit: true,
    showButtonRemove: true,
    showButtonNew: false,
    columnsRecords: [
      {
        caption: 'ID',
        dataField: 'cotizacionId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: '# Cotización',
        dataField: 'documentoNo',
        width: 300
      },
      {
        caption: '# Hoja Ingreso',
        dataField: 'noControl',
        width: 300
      },
      {
        caption: 'Cliente',
        dataField: 'clienteName',
        width: 300
      },
      {
        caption: 'Estado',
        dataField: 'estadoName',
        width: 100
      },
      {
        caption: 'Fecha Doc.',
        dataField: 'fechaDocumento',
        width: 175
      },
      {
        caption: 'Notas',
        dataField: 'notas',
        width: 350
      },
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      this.isNew = isNew;
      data.cotizacionDetalle ??= [];

      if (isNew) {
        data.documentoNo = generateUUID();
        data.fechaDocumento = new Date();

        const valueEstado = this.estadosDocumento?.find((data) => data.posicion === 0);
        data.estado = valueEstado?.catalogosId;
      }

      this.selectedRecord = data;
    },
    expands: ['cotizacionDetalle'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };
  submitCodeButtonOptions?: Record<string, unknown> = {
    icon: 'fa-regular fa-paper-plane',
    text: 'Enviar',
    stylingMode: 'contained',
    onClick: () => {
      if (this.selectedTipoMensaje) {
        this.loadingVisibleSendCotizacion = true;
        let promise: Promise<void> | null = null;
        if (this.selectedTipoMensaje.code === 'WA')
          promise = this.sendAprobacionWA();

        if (promise)
          promise.then(() => this.notifications.showMessage('Cotización enviado con éxito', 'success'))
            .catch((error: Error) => this.notifications.showMessage(error, 'success'))
            .finally(() => {
              this.loadingVisibleSendCotizacion = false;
              this.popupVisibleSendCotizacion = false;
              this.selectedTipoMensaje = undefined;
            })

        return;
      }

      this.notifications.showMessage('Debe de seleccionar un medio de envío', 'error');
    },
  };

  private primerElemento: number = 0;
  private totalElementos: number = 0;
  private service = inject(GeneralService);
  private notifications = inject(NotificacionesService);
  private obtenerReporte$: Subject<string> = new Subject<string>();
  private searchCotizacion$: Subject<[string, HttpParams]> = new Subject<[string, HttpParams]>();

  popupVisibleSendCotizacion: boolean = false;
  loadingVisibleSendCotizacion: boolean = false;
  activeIndex: number = 0;
  selectedRecord: any;
  estadosDocumento?: any[];
  validezDias?: any[];
  tipoImpuesto?: any[];
  selectedTipoMensaje?: TipoMensaje;
  tiposMensajes: TipoMensaje[] = [
    { name: 'Whatsapp', code: 'WA' },
    { name: 'SMS', code: 'SMS' },
    { name: 'Correo Electrónico', code: 'EMAIL' }
  ];
  isNew: boolean = false;
  selectedCotizacionesPorHojaIngreso: any[] = [];
  reportFileRender: string | undefined = undefined;
  currentZoomReport: number | string | undefined = 'page-width'
  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'direccion', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor(private pdfViewerService: NgxExtendedPdfViewerService) {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
      validezdias: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'ValidezDias'", })),
      tipoimpuesto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoImpuesto'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
        this.validezDias = values.validezdias;
        this.tipoImpuesto = values.tipoimpuesto;
      }
    });

    this.obtenerReporte$.pipe(
      tap((reporteName: string) => {
        this.loadingVisibleReporte = true;
      }),
      exhaustMap((reporteName: string) => this.service.Get(this.parametros.getUrl, `GetReport?filename=${reporteName}`)),
      takeUntilDestroyed(),
      catchError((error, originalObs) => {
        this.notifications.showMessage(this.service.handleMessageError(error), 'error');
        this.loadingVisibleReporte = false

        return originalObs;
      })
    ).subscribe({
      next: (dataResponse: any) => {
        const data = structuredClone(this.selectedRecord);
        data.subTotal = _.sumBy(data.cotizacionDetalle, 'subTotal');
        data.impuesto = data.subTotal * (data.porcentaje / 100);
        data.impuesto = Number(data.impuesto.toFixed(2))
        data.total = data.subTotal + data.impuesto;

        this.service.GetCarboneReport(dataResponse, 'report_cotizacion' + this.selectedRecord.cotizacionId, data)
          .then((response: any) => {
            this.reportFileRender = response;
          }).catch((error: any) => {
            this.notifications.showMessage(error, 'error');
          });
      }
    });

    this.searchCotizacion$.pipe(
      exhaustMap(([url, params]) => this.service.GetODATA(url, params)),
      takeUntilDestroyed(),
      catchError((error, originalObs) => {
        let message = error?.message ?? error;
        if (error.error?.Message !== undefined)
          message = error.error.Message + ' - ' + message;

        this.loadingData = false;
        this.indexTab.set(0);
        this.selectedCotizacionesPorHojaIngreso = [];
        this.notifications.showMessage(message, 'error');

        return originalObs;
      })
    ).subscribe({
      next: (responseGridCrud: any) => {
        if (responseGridCrud.totalCount === 0) {
          this.notifications.showMessage('Cotizaciones no encontradas, favor verificar', 'error');
          this.indexTab.set(0);

          return;
        }

        this.loadingData = false;
        this.selectedCotizacionesPorHojaIngreso = responseGridCrud?.value as any[]
        [this.selectedRecord] = this.selectedCotizacionesPorHojaIngreso;
        this.totalElementos = responseGridCrud?.totalCount ?? 0;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["hojaIngresoId"]) {
      this.readonly = true;
      this.loadingData = true;

      const url: string = this.parametros.getUrl;
      const params: HttpParams = new HttpParams({
        fromString: `$filter=hojaIngresoEquipoId eq ${this.hojaIngresoId}` +
          (this.parametros.expands ? '&$expand=' + this.parametros.expands : '') +
          '&$orderby=hojaIngresoEquipoId desc&$count=true'
      });

      this.searchCotizacion$.next([url, params]);
    }
  }

  onClickButtonOptions(event: string) {
    if (event === 'anterior') {
      this.primerElemento--;
      if (this.primerElemento < 0) {
        this.primerElemento = 0;

        return;
      }

      this.selectedRecord = this.selectedCotizacionesPorHojaIngreso[this.primerElemento];
    } else if (event === 'siguiente') {
      this.primerElemento++;
      if (this.primerElemento > (this.totalElementos - 1)) {
        this.primerElemento = this.totalElementos - 1;

        return;
      }

      this.selectedRecord = this.selectedCotizacionesPorHojaIngreso[this.primerElemento];
    } else if (event === 'reporte') {
      this.loadingVisibleReporte = false;
      this.reportFileRender = undefined;
      this.popupVisibleReporte = true;
      setTimeout(() => {
        this.obtenerReporte$.next('Cotizacion.docx')
      }, 800);
    }
  }

  handleEventEditToolbar(event: DxToolbarComponent) {
    const data = [
      {
        icon: 'fa fa-file',
        hint: 'Reporte',
        onClick: () => {
          this.onClickButtonOptions('reporte');
        }
      }
    ];

    this.gridCrudComponent?.processEventEditToolbar(data);
  }

  public sendAprobacion() {
    this.popupVisibleSendCotizacion = true;
    this.selectedTipoMensaje = undefined;
  }

  private async sendAprobacionEMAIL(): Promise<void> {

  }

  private async sendAprobacionSMS(): Promise<void> {

  }

  private async sendAprobacionWA(): Promise<void> {

  }

  validateNumber(e: any) {
    return e.value > 0;
  }
}
