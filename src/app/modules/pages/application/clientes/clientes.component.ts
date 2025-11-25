import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DxButtonModule, DxFormModule, DxTemplateModule } from 'devextreme-angular';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpParams } from '@angular/common/http';
import { GeneralService } from 'src/app/core/services/general.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, DxTemplateModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export default class ClientesComponent {
  parametros: gridParamCrud = {
    getUrl: 'Clientes',
    key: 'clientesId',
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
        dataField: 'clientesId',
        sort: true,
        desc: true,
        default: 0,
        visible: false,
      },
      {
        caption: 'Nombre',
        dataField: 'nombre'
      },
      {
        caption: 'Apellido',
        dataField: 'apellido'
      },
      {
        caption: 'Correo',
        dataField: 'correoElectronico',
        width: 150
      },
      {
        caption: 'celular',
        dataField: 'celular',
        width: 100
      },
      {
        caption: '# Doc.',
        dataField: 'noDocumento',
        width: 200
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
  tipoDocumentos?: any[];
  phonePattern = /^[02-9]\d{9}$/;

  private service = inject(GeneralService);

  constructor() {
    forkJoin({
      documentos: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'Documentos'", }))
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.tipoDocumentos = values.documentos;
      }
    });
  }
}
