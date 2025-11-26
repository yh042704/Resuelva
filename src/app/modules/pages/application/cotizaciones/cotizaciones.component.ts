import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, Input, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxButtonModule, DxCheckBoxModule, DxFormModule, DxSelectBoxModule, DxTemplateModule, DxToolbarComponent } from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import { generateUUID } from 'src/app/modules/shared/options';
import { SkeletonComponent } from 'src/app/modules/shared/skeleton/skeleton.component';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { CotizacionesDetalleComponent } from './cotizaciones-detalle/cotizaciones-detalle.component';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, DxTemplateModule, CotizacionesDetalleComponent,
    DxSelectBoxModule, DxCheckBoxModule, SkeletonComponent, DxSelectBoxModule],
  templateUrl: './cotizaciones.component.html',
  styleUrl: './cotizaciones.component.scss'
})
export default class CotizacionesComponent {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;
  @Input() hojaIngresoId: number = 0;

  loadingData: boolean = false;
  readonly: boolean = false;
  parametros: gridParamCrud = {
    getUrl: 'Cotizaciones',
    key: 'cotizacionId',
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
        dataField: 'cotizacionId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: '# Cotización',
        dataField: 'documentoNo',
        width: 300
      },
      {
        caption: '# Hoja Ingreso',
        dataField: 'noControl',
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
        caption: 'Notas',
        dataField: 'notas',
        width: 350
      },
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {
      data.cotizacionDetalle ??= [];

      if (isNew) {
        data.documentoNo = generateUUID();
        data.fechaDocumento = new Date();

        const valueEstado = this.estadosDocumento?.find((data) => data.posicion === 0);
        data.estado = valueEstado.catalogosId;
      }

      this.selectedRecord = data;
    },
    expands: ['cotizacionDetalle'],
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  private service = inject(GeneralService);

  activeIndex: number = 0;
  selectedRecord: any;
  estadosDocumento?: any[];
  validezDias?: any[];
  tipoImpuesto?: any[];
  displayExprTemplate = (field: any) => field != null ? field.nombre + ' ' + field.apellido : '';
  itemTemplate = (itemData: any, itemIndex: any, itemElement: any) => `${itemData.nombre} ${itemData.apellido}`;
  dsClientes = this.service.GetDatasourceList('Clientes', ['clientesId', 'nombre', 'apellido', 'correoElectronico', 'celular'], 'nombre', undefined, undefined, true).GetDatasourceList();

  constructor() {
    forkJoin({
      estados: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'Estados'", })),
      validezdias: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'ValidezDias'", })),
      tipoimpuesto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoImpuesto'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.estadosDocumento = values.estados;
        this.validezDias = values.validezdias;
        this.tipoImpuesto = values.tipoimpuesto;
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
