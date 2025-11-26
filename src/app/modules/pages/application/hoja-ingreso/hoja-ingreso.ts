import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxHtmlEditorModule, DxSelectBoxModule, DxTemplateModule, DxToolbarComponent } from 'devextreme-angular';
import { EditorModule } from 'primeng/editor';
import { TabViewModule } from 'primeng/tabview';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import { generateUUID } from 'src/app/modules/shared/options';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { HojaIngresoDetalleComponent } from './hoja-ingreso-detalle/hoja-ingreso-detalle.component';

@Component({
  selector: 'app-hoja-ingreso',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, TabViewModule, DxTemplateModule,
    HojaIngresoDetalleComponent, DxSelectBoxModule, EditorModule, DxHtmlEditorModule, DxCheckBoxModule, FormsModule],
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
        caption: 'estado',
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
    onValidateSave: (data: any, isNew: boolean) => {
      console.log(data)
      return true
    },
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      data.hojaIngresoEquipoDetalles ??= [];

      if (isNew) {
        data.noControl = generateUUID();
        data.fechaDocumento = new Date();

        const valueEstado = this.estadosDocumento?.find((data) => data.posicion === 0);
        data.estado = valueEstado.catalogosId;
      }

      this.selectedRecord = data;
    },
    expands: ['hojaIngresoEquipoDetalles'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  private service = inject(GeneralService);

  activeIndex: number = 0;
  selectedRecord: any;
  selectedRecordDetails: any = null;
  estadosDocumento?: any[];
  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor() {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
      }
    });
  }

  handleEventEditToolbar(event: DxToolbarComponent) {
    const items = event.instance.option('items');
  }

  validateNumber(e: any) {
    return e.value > 0;
  }
}
