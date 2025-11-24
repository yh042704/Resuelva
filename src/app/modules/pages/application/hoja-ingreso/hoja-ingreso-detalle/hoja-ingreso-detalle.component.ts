import { Component, Input, model, ViewChild } from '@angular/core';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import GridCrudComponent from 'src/app/modules/shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-hoja-ingreso-detalle',
  standalone: true,
  imports: [GridCrudComponent],
  templateUrl: './hoja-ingreso-detalle.component.html',
  styleUrl: './hoja-ingreso-detalle.component.scss'
})
export class HojaIngresoDetalleComponent {
  @ViewChild('dataGridCrudDetalleEditTable') dataGridCrudDetalleEditTable?: GridCrudComponent;

  @Input() HojaIngresoId: number = 0;
  @Input() readOnlyForm: boolean = false;
  surveyDetalleTemplate = model<any[]>([]);

  parametros: gridParamCrud = {
    getUrl: '',
    key: '',
    keyType: 'Int32',
    QuerySelectAll: false,
    pageSize: 0,
    removeUsingKey: false,
    reloadEditDataByKey: false,
    showButtonRefresh: false,
    showButtonEdit: false,
    showButtonRemove: false,
    showButtonNew: false,
    columnsRecords: [
      {
        type: 'buttons',
        width: 60,
      },
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
    createUrl: '',
    updateUrl: '',
    deleteUrl: '',
    deleteKeyUrl: ''
  };

  onInitNewRow(e: any): void {
    // const newKey = Math.max(...this.surveyFormulaTemplate().filter((x: any) => x?.action !== 'del').map((item: any) => item.seqNo)) + 1;
    // e.data.surveyId = this.surveyId;
    // e.data.seqNo = isFinite(newKey) ? newKey : 1;
    // e.data.group1 = 0;
    // e.data.group2 = 0;
    // e.data.group3 = 0;
    // e.data.groupId = 0;
    // e.data.typeCalculate = 0;
    // e.data.refTableJSON = 0;
    // e.data.isActive = true;
    // e.data.order = 0;
  }
}
