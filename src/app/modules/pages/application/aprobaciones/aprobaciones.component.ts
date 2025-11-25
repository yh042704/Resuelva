import { Component } from '@angular/core';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-aprobaciones',
  standalone: true,
  imports: [GridCrudComponent],
  templateUrl: './aprobaciones.component.html',
  styleUrl: './aprobaciones.component.scss'
})
export default class AprobacionesComponent {
  parametros: gridParamCrud = {
    getUrl: 'Aprobaciones',
    key: 'aprobacionesId',
    keyType: 'Int32',
    QuerySelectAll: false,
    pageSize: 20,
    autowidth: false,
    removeUsingKey: false,
    reloadEditDataByKey: false,
    showButtonRefresh: true,
    showButtonEdit: false,
    showButtonRemove: false,
    showButtonNew: false,
    columnsRecords: [
      {
        caption: 'ID',
        dataField: 'aprobacionesId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: 'Usuario Solicitante',
        dataField: 'nombreUsuario',
        width: 300
      },
      {
        caption: 'Cliente',
        dataField: 'nombreCliente',
        width: 300
      },
      {
        caption: '# Cotización',
        dataField: 'NoDocumento',
        width: 200
      },
      {
        caption: 'Método',
        dataField: 'nombreOrigenAprobacion',
        width: 200
      },
      {
        caption: 'Fecha Sol.',
        dataField: 'fechaRegistro',
        width: 150,
        dataType: 'date',
        format: 'dd/MMM/yyyy hh:mm aa',
      },
      {
        caption: 'Fecha Firma',
        dataField: 'fechaEstado',
        width: 150,
        dataType: 'date',
        format: 'dd/MMM/yyyy hh:mm aa',
      },
      {
        caption: 'Estado',
        dataField: 'nombreEstado',
        width: 300
      },
      {
        caption: 'Observaciones',
        dataField: 'observaciones',
        width: 450
      },
      {
        caption: 'Firma',
        dataField: 'firmaElectronica',
        width: 200
      }
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
    },
    createUrl: '',
    updateUrl: '',
    deleteUrl: '',
    deleteKeyUrl: ''
  };
}
