import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DxButtonModule, DxFormModule, DxTemplateModule, DxToolbarComponent } from 'devextreme-angular';
import { TabViewModule } from 'primeng/tabview';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { HojaIngresoDetalleComponent } from './hoja-ingreso-detalle/hoja-ingreso-detalle.component';

@Component({
  selector: 'app-hoja-ingreso',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, TabViewModule, DxTemplateModule, HojaIngresoDetalleComponent],
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
        width: 150
      },
      {
        caption: 'Cliente',
        dataField: 'clienteName'
      },
      {
        caption: 'estado',
        dataField: 'estadoName',
        width: 150
      },
      {
        caption: 'Fecha Doc.',
        dataField: 'fechaDocumento',
        width: 100
      },
      {
        caption: 'Descripción',
        dataField: 'descripcionProblema',
        width: 200
      },
    ],
    // expands: ['surveyFormulaTemplate'],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      data.hojaEquiposDetalles ??= [];
    },
    expands: ['hojaEquiposDetalles'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  handleEventEditToolbar(event: DxToolbarComponent) {
    const items = event.instance.option('items');
  }
}
