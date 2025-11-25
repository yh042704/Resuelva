import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxButtonModule, DxFormModule, DxTemplateModule } from 'devextreme-angular';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-catalogos-generales',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, DxTemplateModule],
  templateUrl: './catalogos-generales.component.html',
  styleUrl: './catalogos-generales.component.scss'
})
export default class CatalogosGeneralesComponent {
  parametros: gridParamCrud = {
    getUrl: 'Catalogo',
    key: 'catalogosId',
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
        dataField: 'catalogosId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: 'Tabla',
        dataField: 'nombreTabla',
        default: '',
        width: 150
      },
      {
        caption: 'Orden',
        dataField: 'posicion',
        default: 0,
        width: 80
      },
      {
        caption: 'Descripcion',
        dataField: 'descripcion'
      },
      {
        caption: 'Etiqueta',
        dataField: 'etiqueta',
        width: 150
      }
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
    },
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };
}
