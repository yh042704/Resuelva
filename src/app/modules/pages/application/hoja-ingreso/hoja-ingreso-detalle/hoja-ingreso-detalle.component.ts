import { HttpParams } from '@angular/common/http';
import { Component, effect, inject, Input, model, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxSelectBoxModule } from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import GridCrudComponent from 'src/app/modules/shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-hoja-ingreso-detalle',
  standalone: true,
  imports: [GridCrudComponent, DxSelectBoxModule],
  templateUrl: './hoja-ingreso-detalle.component.html',
  styleUrl: './hoja-ingreso-detalle.component.scss'
})
export class HojaIngresoDetalleComponent {
  @ViewChild('dataGridCrudDetalleEditTable') dataGridCrudDetalleEditTable?: GridCrudComponent;

  @Input() hojaIngresoId: number = 0;
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
        buttons: ["edit", "delete",
          {
            icon: "fa-brands fa-algolia",
            hint: "Hallazgo",
            onClick: (e: any) => {
              this.selectedRecord.set(e.row.data);

              setTimeout(() => {
                const tipoHard = this.tipoHardware.find(data => data.catalogosId === e.row.data.tipoHardware);
                this.selectedRecord().descripTipoHardware = tipoHard.descripcion;

                if ((this.selectedRecord().action ?? '') === '')
                  this.selectedRecord().action = 'upd';

                this.activeIndex.set(1);
              }, 100);
            }
          },
          {
            icon: "fa-solid fa-pen-to-square",
            hint: "Pruebas",
            onClick: (e: any) => {
              this.selectedRecord.set(e.row.data);

              setTimeout(() => {
                const tipoHard = this.tipoHardware.find(data => data.catalogosId === e.row.data.tipoHardware);
                this.selectedRecord().descripTipoHardware = tipoHard.descripcion;

                if ((this.selectedRecord().action ?? '') === '')
                  this.selectedRecord().action = 'upd';

                this.activeIndex.set(2);
              }, 100);
            }
          },
          {
            icon: "fa-solid fa-handshake",
            hint: "Recomendaciones",
            onClick: (e: any) => {
              this.selectedRecord.set(e.row.data);

              setTimeout(() => {
                const tipoHard = this.tipoHardware.find(data => data.catalogosId === e.row.data.tipoHardware);
                this.selectedRecord().descripTipoHardware = tipoHard.descripcion;

                if ((this.selectedRecord().action ?? '') === '')
                  this.selectedRecord().action = 'upd';

                this.activeIndex.set(3);
              }, 100);
            }
          }
        ],
        isCustomize: true,
        width: 150
      },
      {
        caption: 'ID',
        dataField: 'hojaIngresoEquipoDetalleId',
        sort: true,
        desc: true,
        default: 0,
        width: 100,
        visible: false,
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
        width: 225
      },
      {
        caption: 'Marca',
        dataField: 'marca',
        width: 225,
        validationRules: [
          { type: 'required', message: 'Marca es requerida' }
        ],
      },
      {
        caption: 'Modelo',
        dataField: 'modelo',
        width: 225,
        validationRules: [
          { type: 'required', message: 'Modelo es requerida' }
        ],
      },
      {
        caption: 'Serie',
        dataField: 'serie',
        width: 225
      },
      {
        caption: 'Características',
        dataField: 'caracteristicas',
        width: 300
      },
      {
        caption: 'Asignado',
        dataField: 'usuarioIdAsignado',
        lookup: {
          dataSource: () => ({
            store: this.usuarios,
          }),
          displayExpr: 'nombre',
          valueExpr: 'usuarioId',
        },
        width: 225
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

  usuarios: any[] = [];
  tipoHardware: any[] = [];

  constructor() {
    forkJoin({
      tipoHardware: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoHardware'", })),
      usuarios: this.service.Get('Usuarios', '', new HttpParams({ fromString: "$select=usuarioId,nombre,apellido&$orderby=nombre, apellido&filter=TipoUsuario eq 1021", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.usuarios = values.usuarios;
        this.tipoHardware = values.tipoHardware;

        const instanceGrid = this.dataGridCrudDetalleEditTable?.dataGrid()?.instance;
        instanceGrid?.columnOption('tipoHardware').lookup.update();
        instanceGrid?.columnOption('usuarioIdAsignado').lookup.update();
        instanceGrid?.repaint();
      }
    });

    effect(() => {
      if (this.activeIndex() === 0)
        this.selectedRecord.set(null);
    }, { allowSignalWrites: true });
  }

  onInitNewRow(e: any): void {
    e.data.hojaIngresoEquipoDetalleId = 0;
    e.data.hojaIngresoId = this.hojaIngresoId;
    e.data.hallazgo = '';
    e.data.pruebas = '';
    e.data.recomendaciones = '';
  }
}
