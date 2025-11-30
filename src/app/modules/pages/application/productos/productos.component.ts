import { HttpParams } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxFormModule, DxTemplateModule } from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import GridCrudComponent from 'src/app/modules/shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [GridCrudComponent, DxFormModule, DxTemplateModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export default class ProductosComponent {
  parametros: gridParamCrud = {
    getUrl: 'Productos',
    key: 'productosId',
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
        dataField: 'productosId',
        sort: true,
        desc: true,
        default: 0,
        visible: false
      },
      {
        caption: 'Código',
        dataField: 'codigo',
        width: 80
      },
      {
        caption: 'Nombre',
        dataField: 'nombre'
      },
      {
        caption: 'Ubicación',
        dataField: 'ubicacion',
        width: 225
      },
      {
        caption: 'Existencia',
        dataField: 'existencia',
        width: 100
      },
      {
        caption: 'Costo',
        dataField: 'costo',
        width: 100
      },
      {
        caption: 'Precio',
        dataField: 'precio',
        width: 100
      }
    ],
    onValidateSave: (data: any, isNew: boolean) => true,
    onValidateCancel: (data: any, isNew: boolean): boolean => true,
    onBeforeEdit: (data: any, isNew: boolean): void => {

      if(isNew)
        data.activo = true;

      this.selectedRecord = data;
    },
    createUrl: '/create',
    updateUrl: '/update',
    deleteUrl: '/remove',
    deleteKeyUrl: '/removeByKey'
  };

  selectedRecord: any;
  tipoProducto?: any[];

  private service = inject(GeneralService);

  constructor() {
    forkJoin({
      tipoProducto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoProducto'", }))
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.tipoProducto = values.tipoProducto;
      }
    });
  }
}
