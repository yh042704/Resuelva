import { HttpParams } from '@angular/common/http';
import { Component, effect, inject, Input, model, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from '../../../../../core/interfaces/gridParamCrud';
import { GeneralService } from '../../../../../core/services/general.service';
import GridCrudComponent from '../../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-orden-trabajo-detalle',
  standalone: true,
  imports: [GridCrudComponent],
  templateUrl: './orden-trabajo-detalle.component.html',
  styleUrl: './orden-trabajo-detalle.component.scss'
})
export class OrdenTrabajoDetalleComponent {
  @ViewChild('dataGridCrudDetalleEditTable') dataGridCrudDetalleEditTable?: GridCrudComponent;

  @Input() ordenTrabajoId: number = 0;
  @Input() readOnlyForm: boolean = false;

  activeIndex = model<number>(0);
  selectedRecord = model<any>(null);
  surveyDetalleTemplate = model<any[]>([]);

  parametros: gridParamCrud = {
    getUrl: '',
    key: '',
    keyType: 'Int32',
    autowidth: false,
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
        type: "buttons",
        buttons: [{
          icon: "fa-solid fa-pen-to-square",
          hint: "Descripción",
          onClick: (e: any) => {
            this.changeValuesDetalle(e.row.data, 1);
          }
        }],
        isCustomize: true,
        width: 115
      },
      {
        caption: 'ID',
        dataField: 'ordenTrabajoDetalleId',
        sort: true,
        desc: true,
        default: 0,
        width: 100,
        visible: false,
      },
      {
        caption: 'Producto',
        dataField: 'descripcionProducto',
        width: 300,
        allowEditing: false
      },
      {
        caption: 'Tipo',
        dataField: 'tipoHardware',
        lookup: {
          dataSource: () => ({
            store: this.tipoHardware,
          }),
          displayExpr: 'descripcion',
          valueExpr: 'catalogosId',
        },
        width: 225,
        allowEditing: false
      },
      {
        caption: 'Marca',
        dataField: 'marca',
        width: 225,
        allowEditing: false
      },
      {
        caption: 'Modelo',
        dataField: 'modelo',
        width: 225,
        allowEditing: false
      },
      {
        caption: 'Serie',
        dataField: 'serie',
        width: 225,
        allowEditing: false
      },
      {
        caption: 'Características',
        dataField: 'caracteristicas',
        width: 300,
        allowEditing: false
      },
      {
        dataField: 'actividadId',
        visible: false
      },
       {
        dataField: 'descripcion',
        visible: false
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

  private service = inject(GeneralService);
  tipoHardware: any[] = [];

  constructor() {
    forkJoin({
      tipoHardware: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoHardware'", }))
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.tipoHardware = values.tipoHardware;

        const instanceGrid = this.dataGridCrudDetalleEditTable?.dataGrid()?.instance;
        instanceGrid?.columnOption('tipoHardware').lookup.update();
        instanceGrid?.repaint();
      }
    });

    effect(() => {
      if (this.activeIndex() === 0)
        this.selectedRecord.set(null);
    }, { allowSignalWrites: true });
  }

  changeValuesDetalle(dataSelect: any, index: number) {
    this.selectedRecord.set(dataSelect);

    setTimeout(() => {
      const tipoHard = this.tipoHardware.find(data => data.catalogosId === dataSelect.tipoHardware);
      this.selectedRecord().descripTipoHardware = tipoHard.descripcion;

      if ((this.selectedRecord().action ?? '') === '')
        this.selectedRecord().action = 'upd';

      this.activeIndex.set(index);
    }, 100);
  }
}
