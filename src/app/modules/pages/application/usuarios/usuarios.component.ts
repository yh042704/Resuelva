import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxButtonModule, DxFormComponent, DxFormModule, DxTemplateModule, DxTextBoxModule } from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from '../../../../core/interfaces/gridParamCrud';
import { GeneralService } from '../../../../core/services/general.service';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, GridCrudComponent, DxButtonModule, DxFormModule, DxTemplateModule, DxTextBoxModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export default class UsuariosComponent {
  @ViewChild(DxFormComponent, { static: false }) form?: DxFormComponent;

  parametros: gridParamCrud = {
    getUrl: 'Usuarios',
    key: 'usuarioId',
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
        dataField: 'usuarioId',
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
        width: 350
      },
      {
        caption: 'celular',
        dataField: 'celular',
        width: 175
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
  tipoUsuarios?: any[];
  phonePattern = /^[02-9]\d{9}$/;
  iconInvisible: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfkAxoRLTO7G8yhAAABeElEQVQ4y53Uz0uUURTG8c/k4KKhAqdEiZAIpGXLoB+bcGULMSlGGogKElroRqioRS0CKQjxDxjShfgXtKiN0KYIJYRaKklQku3VmTster3emYGY6dzVe87zfd73cM59+a843Zn8tl3ldsV5HJVXwQJyzrnijD45275676PQik0JqsooWlVvOOseKvwbWWlC6r4ZbgYmBfUM6XFZQcFF80KG1DxO5U+jV9V4g9Go3Vh7sp+8Hn0OkLzn7shhOqldg16/YmLbtJAhRSteoNtWrG85wcvEYQkP1FWVUPRJEUuJYoaN5HEWF7IPK6HHKcwlio1DKkmL/fhiD10WlPy2iZOJ4jXHbCY9HMaj2H4JLCfzOAJDajH1DFxV8SbpZTUzGNp/0UQEau4l00+R4H46oLt2IvTWmEFnjfueIDeal+O8zy071NhLS3S55UOTOFgTUiTXgg24ZNBxwU/r3vlh0itB2WK7l+zvLlfdbB9gyo6RToCOfxQx/gAUl9Y+isex4QAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMC0wMy0yNlQxNzo0NTo1MSswMDowMHB8Q0AAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjAtMDMtMjZUMTc6NDU6NTErMDA6MDABIfv8AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==";
  iconVisible: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfkAxoRKDkmudH6AAABSUlEQVQ4y93Sv0ocURgF8N+EFO6UrhsQLFWIIpF0QUlpIxbB0sfQfYGonUTyClGJWWMXhVR5AndwieID2Cg4skawUJkUXq+TXbE3323ud865f87H4flX0oVUzRg3gGOZH86eOj6m4UZRWte+GX1cnPrsVqHQtmbegjVthcKtVZVO+bDDcOemakT7NAJ6YKgsn3Qe5YnUskxmSSqxFZjcxL38vcsAtlWlWk79Uii0pGouAntpEkbk0eIXLDvR70NAFrEe+dwIR6WZLCDz04yrgDRRLymyl6665jVlKu6LDq7nhTnnsX2DnX8EOxiPXW72bkYPpvukWvED+ypeRdN/HuY0EY03JCoWNTV9VJHYDsyZd+WnhxwEYkstojXfA/rbYHc0PoVoXFhXV7cRPnNjpTsadzVq03VH+L56/XS8e017G+K9Z1fuv6u/LnGn0KoaVLwAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjAtMDMtMjZUMTc6NDA6NTcrMDA6MDD1hb0+AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIwLTAzLTI2VDE3OjQwOjU3KzAwOjAwhNgFggAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=";
  fieldPasswordMode: string = "password";
  iconPassword: string;
  buttonPasswordEye: any = [];

  private service = inject(GeneralService);

  constructor() {
    forkJoin({
      tipoUsuarios: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,Descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TIPOUSUARIO'", }))
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.tipoUsuarios = values.tipoUsuarios;
      }
    });

    this.iconPassword = this.iconInvisible;
    this.buttonPasswordEye = [
      {
        name: "passwordEye",
        location: "after",
        options: {
          icon: this.iconPassword,
          stylingMode: "underlined",
          onClick: () => {
            this.fieldPasswordMode = this.fieldPasswordMode === "text" ? "password" : "text";
            this.iconPassword = this.fieldPasswordMode === "text" ? this.iconVisible : this.iconInvisible;
          }
        }
      }
    ];
  }

  passwordComparison = () => {
    const password = this.form?.instance.option("formData").password;
    return password;
  };
}
