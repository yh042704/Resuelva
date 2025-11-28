import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxHtmlEditorModule, DxLoadPanelModule, DxPopupModule, DxSelectBoxModule, DxTemplateModule, DxTextBoxModule, DxToolbarComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { TabViewModule } from 'primeng/tabview';
import { forkJoin, take } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import { NotificacionesService } from 'src/app/core/services/notificaciones.service';
import { generateUUID } from 'src/app/modules/shared/options';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { CotizacionesDetalleComponent } from '../cotizaciones/cotizaciones-detalle/cotizaciones-detalle.component';
import CotizacionesComponent from '../cotizaciones/cotizaciones.component';
import { HojaIngresoDetalleComponent } from './hoja-ingreso-detalle/hoja-ingreso-detalle.component';

@Component({
  selector: 'app-hoja-ingreso',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, TabViewModule, DxTemplateModule,
    HojaIngresoDetalleComponent, DxSelectBoxModule, DxHtmlEditorModule, DxCheckBoxModule, FormsModule,
    CotizacionesComponent, CotizacionesDetalleComponent, DxLoadPanelModule, DxPopupModule, DxTextBoxModule],
  templateUrl: './hoja-ingreso.html',
  styleUrl: './hoja-ingreso.scss'
})
export default class HojaIngreso {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;

  parametros: gridParamCrud = {
    getUrl: 'HojaIngresoEquipo',
    key: 'hojaIngresoEquipoId',
    keyType: 'Int32',
    QuerySelectAll: false,
    pageSize: 20,
    autowidth: false,
    removeUsingKey: true,
    reloadEditDataByKey: true,
    showButtonRefresh: true,
    showButtonEdit: true,
    showButtonRemove: true,
    showButtonNew: true,
    columnsRecords: [
      {
        caption: 'ID',
        dataField: 'hojaIngresoEquipoId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: '# Doc.',
        dataField: 'noControl',
        default: '',
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
        caption: 'Descripción',
        dataField: 'descripcionProblema',
        width: 350
      },
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      this.isNew = isNew;
      data.hojaIngresoEquipoDetalles ??= [];

      if (isNew) {
        data.noControl = generateUUID();
        data.fechaDocumento = new Date();
        data.estado = this.getEstadoDocumento('INI');
      }

      setTimeout(() => this.gridCrudComponent?.changeStatusEditButton(), 5);
      this.selectedRecord = data;
      this.activeIndex = 0;
    },
    expands: ['hojaIngresoEquipoDetalles'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  private service = inject(GeneralService);
  private notifications = inject(NotificacionesService);

  isNew: boolean = false;
  menuChanged: boolean = true;
  activeIndex: number = 0;
  selectedRecord: any;
  selectedRecordDetails: any = null;
  loadingVisibleCotizacion: boolean = false;
  loadingVisibleProcessCotizacion: boolean = false;
  estadosDocumento?: any[];
  cotizacionDetalle: any[] = [];
  tipoImpuesto: any[] = [];
  validez: any[] = [];
  selectedCotizaacionMig = {
    selectedTipoImpuesto: undefined,
    selectedHojaDetalleId: undefined,
    selectedValidez: undefined
  };
  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor() {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion,etiqueta&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
      validezdias: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'ValidezDias'", })),
      tipoimpuesto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoImpuesto'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
        this.tipoImpuesto = values.tipoimpuesto;
        this.validez = values.validezdias;
      }
    });
  }

  handleEventEditToolbar(event: DxToolbarComponent) {
    const data = [
      {
        icon: 'pi pi-money-bill',
        hint: 'Ver Cotizaciones',
        validation: () => !this.isNew,
        onClick: () => {
          if (this.selectedRecord.estado === this.getEstadoDocumento('INI')) {
            this.notifications.showMessage('Imposible mostrar cotizaciones, aún no se han creado', 'error')

            return;
          }

          this.menuChanged = false;
          this.activeIndex = 4;
          setTimeout(() => {
            this.menuChanged = true;
          }, 0);
        }
      },
      {
        icon: 'plus',
        hint: 'Crear Cotizaciones',
        validation: () => !this.isNew,
        onClick: () => {
          if (this.selectedRecord.hojaIngresoEquipoDetalles.length === 0) {
            this.notifications.showMessage('Para continuar debe de agregar un detalle', 'error');

            return;
          }

          this.cotizacionDetalle = [];
          this.selectedCotizaacionMig.selectedHojaDetalleId = undefined;
          this.selectedCotizaacionMig.selectedTipoImpuesto = undefined;
          this.selectedCotizaacionMig.selectedValidez = undefined;
          this.loadingVisibleCotizacion = true;
        }
      },
      {
        icon: 'fa-solid fa-business-time',
        hint: 'Crear Orden de Trabajo',
        validation: () => !this.isNew,
        onClick: () => {
          if (this.selectedRecord.estado === this.getEstadoDocumento('INI') && this.selectedRecord.estado !== this.getEstadoDocumento('FIN')) {
            this.notifications.showMessage('Imposible crear una orden de trabajo, aún no se han creado cotizaciones o está finalizada', 'error')

            return;
          }

          this.gridCrudComponent?.showLoadingGrid(true, true);
          this.service.Get(this.parametros.getUrl, 'CrearOrdenTrabajo?hojaIngresoId=' + this.selectedRecord.hojaIngresoEquipoId)
            .pipe(take(1))
            .subscribe(
              {
                next: (response: any) => {
                  this.notifications.showMessage('Hoja de trabajo creada con exito', 'success');
                  const estado = this.getEstadoDocumento('TRAB');
                  this.selectedRecord.estado = estado;
                  this.gridCrudComponent?.showLoadingGrid(false, true);
                },
                error: (err) => {
                  this.notifications.showMessage(err, 'error');
                  this.gridCrudComponent?.showLoadingGrid(false, true);
                }
              });
        }
      }
    ];

    this.gridCrudComponent?.processEventEditToolbar(data);
  }

  onValueReportChanged(event: any) {
    const selected = event.component.option('selectedItem');

    if (event.element.id === 'hard') {
      this.selectedCotizaacionMig.selectedHojaDetalleId = selected.hojaIngresoEquipoDetalleId;
    } else if (event.element.id === 'imp') {
      this.selectedCotizaacionMig.selectedTipoImpuesto = selected.catalogosId;
    } else if (event.element.id === 'validez') {
      this.selectedCotizaacionMig.selectedValidez = selected.catalogosId;
    }
  }

  crearCotizacion(event: any) {
    if (this.cotizacionDetalle.length === 0) {
      this.notifications.showMessage('Para continuar debe de agregar un detalle en la cotización', 'error');

      return;
    }

    confirm(`¿Está seguro que desea crear la cotización?`, "Confirmación")
      .then(dialogResult => {
        if (dialogResult) {
          this.loadingVisibleProcessCotizacion = true;
          const estadoDoc = this.getEstadoDocumento('INI');

          const createCotizacion = {
            cotizacionId: 0,
            hojaIngresoEquipoId: this.selectedRecord.hojaIngresoEquipoId,
            documentoNo: generateUUID(),
            clientesId: this.selectedRecord.clientesId,
            fechaDocumento: new Date(),
            validezDias: this.selectedCotizaacionMig.selectedValidez,
            tipoImpuesto: this.selectedCotizaacionMig.selectedTipoImpuesto,
            estado: estadoDoc,
            fechaCreacion: new Date(),
            fechaActualizacion: new Date(),
            cotizacionDetalle: this.cotizacionDetalle
          }

          this.service.Post('Cotizaciones', 'create', createCotizacion)
            .pipe(take(1))
            .subscribe(
              {
                next: (response: any) => {
                  this.notifications.showMessage('Cotización creada con exito', 'success');
                  const estado = this.getEstadoDocumento('COT');
                  this.selectedRecord.estado = estado;
                  this.loadingVisibleCotizacion = false;
                  this.loadingVisibleProcessCotizacion = false;
                },
                error: (err) => {
                  this.loadingVisibleCotizacion = false;
                  this.loadingVisibleProcessCotizacion = false;
                  this.notifications.showMessage('Ocurrió un error al momento de crear la cotización', 'error');
                }
              });
        }
      });
  }

  validateNumber(e: any) {
    return e.value > 0;
  }

  getEstadoDocumento(etiqueta: string) {
    const valueEstado = this.estadosDocumento?.find((data) => data.etiqueta === etiqueta);
    return valueEstado?.catalogosId;
  }
}
