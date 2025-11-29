import { Component } from '@angular/core';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-movimientos-inventario',
  standalone: true,
  imports: [GridCrudComponent],
  templateUrl: './movimientos-inventario.component.html',
  styleUrl: './movimientos-inventario.component.scss'
})
export default class MovimientosInventarioComponent {
  parametros: gridParamCrud = {
    getUrl: 'MovimientoProductos',
    key: 'movimientoProductosId',
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
        dataField: 'movimientoProductosId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: 'Tipo Mov.',
        dataField: 'nombreTipoMovimiento',
        width: 150
      },
      {
        caption: 'Origen',
        dataField: 'origen',
        width: 150
      },
      {
        caption: 'Producto',
        dataField: 'nombreProducto',
        width: 275
      },
      {
        caption: 'Cantidad',
        dataField: 'cantidad',
        width: 125
      },
      {
        caption: 'Fecha Mov.',
        dataField: 'fechaMovimiento',
        width: 225,
        dataType: 'date',
        format: 'dd/MMM/yyyy hh:mm aa',
      },
      {
        caption: 'Exis. Anterior',
        dataField: 'existenciaAnterior',
        width: 125
      },
      {
        caption: 'Exist. Nueva',
        dataField: 'existenciaNueva',
        width: 125
      },
      {
        caption: '# Doc.',
        dataField: 'documentoNoRef',
        width: 300
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
