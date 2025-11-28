import { HttpParams } from '@angular/common/http';
import { Component, inject, Input, model, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DxSelectBoxModule } from 'devextreme-angular';
import dxSelectBox from 'devextreme/ui/select_box';
import { forkJoin } from 'rxjs';
import { gridParamCrud } from 'src/app/core/interfaces/gridParamCrud';
import { GeneralService } from 'src/app/core/services/general.service';
import GridCrudComponent from 'src/app/modules/shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-cotizaciones-detalle',
  standalone: true,
  imports: [GridCrudComponent, DxSelectBoxModule],
  templateUrl: './cotizaciones-detalle.component.html',
  styleUrl: './cotizaciones-detalle.component.scss'
})
export class CotizacionesDetalleComponent {
  @ViewChild('dataGridCrudCotizacionDetalleEditTable') dataGridCrudDetalleEditTable?: GridCrudComponent;

  @Input() cotizacionId: number = 0;
  @Input() hojaIngresoEquipoDetalleId?: number;
  @Input() tipoImpuestoId: number = 0;
  @Input() readOnlyForm: boolean = false;

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
        type: 'buttons',
        width: 65
      },
      {
        caption: 'ID',
        dataField: 'cotizacionDetalleId',
        sort: true,
        desc: true,
        default: 0,
        width: 100,
        visible: false,
      },
      {
        caption: 'Tipo',
        dataField: 'tipoProducto',
        align: 'left',
        editCellTemplate: (container: any, options: any) => {
        const selectBoxSampleElement = document.getElementById('selectBoxSample')?.cloneNode(true) as HTMLElement;
          const dxSelec = new dxSelectBox(selectBoxSampleElement, {
            placeholder: 'Seleccione...',
            items: this.tipoProducto,
            value: options.data.tipoProducto,
            displayExpr: 'descripcion',
            valueExpr: 'catalogosId',
            onValueChanged: (e: any) => {
              setTimeout(() => {
                options.setValue(e.value);

                this.dataGridCrudDetalleEditTable?.dataGrid()?.instance.getDataSource().reload();
              }, 100)
            }
          });

          return dxSelec.element();
        },
        width: 150
      },
      {
        caption: 'Producto',
        dataField: 'productosId',
        alignment: 'left',
        validationRules: [{ type: 'required', message: 'Producto es requerido' }],
        calculateDisplayValue: (rowData: any) => rowData.descripcionProducto,
        editCellTemplate: (container: any, options: any) => {
          const selectBoxSampleElement = document.getElementById('selectBoxSample')?.cloneNode(true) as HTMLElement;
          const dxSelec = new dxSelectBox(selectBoxSampleElement, {
            placeholder: 'Seleccione...',
            dataSource: this.dsProductos.GetDatasourceList(),
            value: options.data.productosId,
            displayExpr: 'nombre',
            valueExpr: 'productosId',
            searchEnabled: true,
            searchExpr: ['nombre', 'codigo'],
            onValueChanged: (e: any) => {
              setTimeout(() => {
                const selectedItemProduct = e.component.option('selectedItem');

                options.data.descripcionProducto = selectedItemProduct.nombre;
                options.data.precio = selectedItemProduct.precio;
                options.data.costo = selectedItemProduct.costo;
                options.setValue(e.value);
                this.dataGridCrudDetalleEditTable?.dataGrid()?.instance.refresh(true);
              }, 100)
            }
          });

          return dxSelec.element();
        },
        width: 350
      },
      {
        dataField: 'descripcionProducto',
        visible: false
      },
      {
        caption: 'Cantidad',
        dataField: 'cantidad',
        validationRules: [
          { type: 'required', message: 'Cantidad es requerida' },
          {
            type: "custom",
            validationCallback: this.validateNumber,
            message: "Cantidad es requerida"
          }
        ],
        setCellValue: (newData: any, value: any, currentRowData: any) => {
          newData.cantidad = value;
          newData.subTotal = (currentRowData.precio * value);
        },
        dataType: "number",
        width: 125
      },
      {
        caption: 'Precio',
        dataField: 'precio',
        dataType: "number",
        validationRules: [
          { type: 'required', message: 'El precio  es requerido' },
          {
            type: "custom",
            validationCallback: this.validateNumber,
            message: "El precio es requerido"
          }
        ],
        allowEditing: false,
        width: 125,
      },
      {
        caption: 'Costo',
        dataField: 'costo',
        dataType: "number",
        validationRules: [
          { type: 'required', message: 'El costo  es requerido' }
        ],
        allowEditing: false,
        width: 125,
      },
      {
        caption: 'Tipo Impuesto',
        dataField: 'tipoImpuesto',
        lookup: {
          dataSource: () => ({
            store: this.tipoImpuesto,
          }),
          displayExpr: 'descripcion',
          valueExpr: 'catalogosId',
        },
        width: 175
      },
      {
        caption: 'SubTotal',
        dataField: 'subTotal',
        calculateDisplayValue: (rowData: any) => rowData.subTotal ? rowData.subTotal : 0.00,
        calculateCellValue: (rowData: any) => { rowData.subTotal = (rowData.cantidad * rowData.precio); return rowData.subTotal },
        dataType: "number",
        format: "#,##0.##",
        allowEditing: false,
        summaryType: "sum",
        width: 175,
      },
      // {
      //   caption: 'Impuesto',
      //   dataField: 'TaxPercent',
      //   dataType: "number",
      //   // allowEditing: false,
      //   format: {
      //     type: "percent",
      //     precision: 2
      //   },
      //   width: 100,
      // }
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

  tipoImpuesto: any[] = [];
  tipoProducto: any[] = [];
  dsProductos = this.service.GetDatasourceList('Productos', ['productosId', 'nombre', 'codigo', 'precio', 'costo'], 'nombre', undefined, undefined, true);

  constructor() {
    forkJoin({
      tipoProducto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoProducto'", })),
      tipoImpuesto: this.service.Get('Catalogo', '', new HttpParams({ fromString: "$select=catalogosId,descripcion,Posicion&$orderby=Posicion&filter=NombreTabla eq 'TipoImpuesto'", })),
    }).pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (values: any) => {
        this.tipoImpuesto = values.tipoImpuesto;
        this.tipoProducto = values.tipoProducto;

        const instanceGrid = this.dataGridCrudDetalleEditTable?.dataGrid()?.instance;
        instanceGrid?.columnOption('tipoProducto').lookup.update();
        instanceGrid?.columnOption('tipoImpuesto').lookup.update();
        instanceGrid?.repaint();
      }
    });
  }

  onInitNewRow(e: any): void {
    e.data.cotizacionDetalleId = 0;
    e.data.hojaIngresoEquipoDetalleId = this.hojaIngresoEquipoDetalleId;
    e.data.cotizacionId = this.cotizacionId;
    e.data.tipoImpuesto = this.tipoImpuestoId;
    e.data.subTotal = 0.0;
    e.data.cantidad = 0;
    e.data.precio = 0;
    e.data.costo = 0
  }

  validateNumber(e: any) {
    return e.value > 0;
  }
}
