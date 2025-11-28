import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxFormModule, DxSelectBoxModule, DxToolbarComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { forkJoin, take } from 'rxjs';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import { GeneralService } from '../../../../core/services/general.service';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { generateUUID } from '../../../shared/options';
import { OrdenVentasDetalleComponent } from './../orden-ventas/orden-ventas-detalle/orden-ventas-detalle.component';

@Component({
  selector: 'app-orden-ventas',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxFormModule, OrdenVentasDetalleComponent, DxSelectBoxModule],
  templateUrl: './orden-ventas.component.html',
  styleUrl: './orden-ventas.component.scss'
})
export default class OrdenVentasComponent {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;

  parametros: gridParamCrud = {
    getUrl: 'Ventas',
    key: 'ordenVentaId',
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
        dataField: 'ordenVentaId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: 'Cliente',
        dataField: 'clienteName',
        width: 300
      },
      {
        caption: '# Doc.',
        dataField: 'documentoNo',
        default: '',
        width: 300
      },
      {
        caption: 'Fecha Doc.',
        dataField: 'fechaDocumento',
        width: 175
      },
      {
        caption: 'Estado',
        dataField: 'estadoName',
        width: 100
      },

    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      data.ordenVentaDetalles ??= [];
      this.selectedRecord = data;
      this.isNew = isNew;

      if (isNew) {
        data.documentoNo = generateUUID();
        data.fechaDocumento = new Date();
        data.estado = this.getEstadoDocumento('INI');
      }

      this.gridCrudComponent?.changeStatusEditButton();
    },
    expands: ['ordenVentaDetalles'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  private service = inject(GeneralService);
  private notifications = inject(NotificacionesService);

  isNew: boolean = false;
  selectedRecord: any = null;
  estadosDocumento?: any[];
  tipoImpuesto?: any[];

  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'direccion', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor() {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion,etiqueta&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
      tipoimpuesto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoImpuesto'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
        this.tipoImpuesto = values.tipoimpuesto;
      }
    });
  }

  handleEventEditToolbar(event: DxToolbarComponent) {
    const data = [
      {
        icon: 'pi pi-check',
        hint: 'Procesar',
        validation: () => !this.isNew,
        onClick: () => {
          if (this.selectedRecord.estado !== this.getEstadoDocumento('INI')) {
            this.notifications.showMessage('Imposible cambiar el estado, favor verificar', 'error')

            return;
          }

          confirm(`¿Está seguro que desea finalizar la orden de compra?`, "Confirmación")
            .then(dialogResult => {
              if (dialogResult) {
                this.gridCrudComponent?.showLoadingGrid(true, true);

                this.service.Put(this.parametros.getUrl, 'ordenCompraId', { DocumentoNo: this.selectedRecord.ordenCompraId })
                  .pipe(take(1))
                  .subscribe(
                    {
                      next: (response: any) => {
                        this.notifications.showMessage('Orden de compra procesada con exito', 'success');
                        const estado = this.getEstadoDocumento('FIN');
                        this.selectedRecord.estado = estado;
                        this.gridCrudComponent?.showLoadingGrid(false, true);
                      },
                      error: (err) => {
                        this.gridCrudComponent?.showLoadingGrid(false, true);
                        this.notifications.showMessage('Ocurrió un error al momento de procesar la orden de compra', 'error');
                      }
                    });
              }
            })
        }
      }
    ];

    this.gridCrudComponent?.processEventEditToolbar(data);
  }

  validateNumber(e: any) {
    return e.value > 0;
  }

  getEstadoDocumento(etiqueta: string) {
    const valueEstado = this.estadosDocumento?.find((data) => data.etiqueta === etiqueta);
    return valueEstado?.catalogosId;
  }
}
