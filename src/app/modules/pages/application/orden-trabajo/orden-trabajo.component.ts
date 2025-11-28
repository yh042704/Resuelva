import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxHtmlEditorModule, DxSelectBoxModule, DxTemplateModule, DxToolbarComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { TabViewModule } from 'primeng/tabview';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import { GeneralService } from '../../../../core/services/general.service';
import { NotificacionesService } from '../../../../core/services/notificaciones.service';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { OrdenTrabajoDetalleComponent } from './orden-trabajo-detalle/orden-trabajo-detalle.component';

@Component({
  selector: 'app-orden-trabajo',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, TabViewModule, DxTemplateModule,
    OrdenTrabajoDetalleComponent, DxSelectBoxModule, DxHtmlEditorModule, DxCheckBoxModule, FormsModule],
  templateUrl: './orden-trabajo.component.html',
  styleUrl: './orden-trabajo.component.scss'
})
export default class OrdenTrabajoComponent {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;

  parametros: gridParamCrud = {
    getUrl: 'OrdenTrabajo',
    key: 'ordenTrabajoId',
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
        dataField: 'ordenTrabajoId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        dataField: 'cotizacionId',
        visible: false
      },
      {
        caption: '# Doc.',
        dataField: 'documentoNo',
        default: '',
        width: 300
      },
      {
        caption: '# Cotización.',
        dataField: 'documentoNoCot',
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
      }
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      data.ordenTrabajoDetalles ??= [];
      this.selectedRecord = data;
      this.activeIndex = 0;
      this.isNew = isNew;

      this.gridCrudComponent?.changeStatusEditButton();
    },
    expands: ['ordenTrabajoDetalles'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  private service = inject(GeneralService);
  private notifications = inject(NotificacionesService);

  isNew: boolean = false;
  selectedRecord: any = null;
  selectedRecordDetails: any = null;
  activeIndex: number = 0;
  estadosDocumento?: any[];
  actividades: any[] = [];

  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor() {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion,etiqueta&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
      actividades: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'Actividades'", }))
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
        this.actividades = values.actividades;
      }
    });
  }

  handleEventEditToolbar(event: DxToolbarComponent) {
    const data = [
      {
        icon: 'pi pi-check',
        hint: 'Finalizar orden de trabajo',
        validation: () => !this.isNew,
        onClick: () => {
          if (this.selectedRecord.estado !== this.getEstadoDocumento('INI')) {
            this.notifications.showMessage('Imposible cambiar el estado, favor verificar', 'error')

            return;
          }

          confirm(`¿Está seguro que desea finalizar la orden de trabajo?`, "Confirmación")
            .then(dialogResult => {
              if (dialogResult) {
                const finalizado = this.getEstadoDocumento('FIN');
                this.selectedRecord.estado = finalizado;
                this.gridCrudComponent?.onButtonClick('save', null, false)
                  .then(() => this.notifications.showMessage('Se cambió con exito el estado de la orden de trabajo', 'success'))
              }
            })
        }
      }
    ];

    this.gridCrudComponent?.processEventEditToolbar(data);
  }

  getEstadoDocumento(etiqueta: string) {
    const valueEstado = this.estadosDocumento?.find((data) => data.etiqueta === etiqueta);
    return valueEstado?.catalogosId;
  }
}
