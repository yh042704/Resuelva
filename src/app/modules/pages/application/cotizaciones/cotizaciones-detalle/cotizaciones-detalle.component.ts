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
  @ViewChild('dataGridCrudDetalleEditTable') dataGridCrudDetalleEditTable?: GridCrudComponent;

  @Input() cotizacionId: number = 0;
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
        width: 65,
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
        lookup: {
          dataSource: () => ({
            store: this.tipoProducto,
          }),
          displayExpr: 'descripcion',
          valueExpr: 'catalogosId',
        },
        width: 175
      },
      {
        caption: 'Producto',
        dataField: 'productoId',
        alignment: 'left',
        validationRules: [{ type: 'required', message: 'Producto es requerido' }],
        calculateDisplayValue: (rowData: any) => rowData.ProductName,
        editCellTemplate: (container: any, options: any) => {
          const selectBoxSampleElement = document.getElementById('selectBoxSample')?.cloneNode(true) as HTMLElement;
          const dxSelec = new dxSelectBox(selectBoxSampleElement, {
            placeholder: 'Seleccione...',
            dataSource: this.dsProductos,
            value: options.data.productoId,
            displayExpr: 'nombre',
            valueExpr: 'productoId',
            showClearButton: true,
            searchEnabled: true,
            searchExpr: ['nombre', 'codigo'],
            onValueChanged: (e: any) => {
              setTimeout(() => {
                const selectedItemProduct = e.component.option('selectedItem');
                options.data.ProductName = selectedItemProduct?.nombre;
                options.data.ProductName = selectedItemProduct?.nombre;
                options.data.ProductName = selectedItemProduct?.nombre;
                options.setValue(e.value);


                this.dataGridCrudDetalleEditTable?.dataGrid()?.instance.getDataSource().reload();
              }, 50)
            }
          });

          return dxSelec.element();
        },
        width: 225
      },
      {
        dataField: 'ProductName',
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
          newData.SubTotal = (currentRowData.FeeCharge * value) - currentRowData.DiscountAmount;
          newData.Quantity = value;
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
          { type: 'required', message: 'El costo  es requerido' },
          {
            type: "custom",
            validationCallback: this.validateNumber,
            message: "El costo es requerido"
          }
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
        width: 225
      },
      {
        caption: 'SubTotal',
        dataField: 'SubTotal',
        calculateDisplayValue: (rowData: any) => rowData.SubTotal ? rowData.SubTotal : 0.00,
        calculateCellValue: (rowData: any) => { rowData.SubTotal = (rowData.cantidad * rowData.precio); return rowData.SubTotal },
        dataType: "number",
        format: "#,##0.##",
        allowEditing: false,
        summaryType: "sum",
        width: 200,
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
  dsProductos = this.service.GetDatasourceList('Productos', ['productosId', 'nombre', 'codigo', 'precio', 'costo'], 'nombre', undefined, undefined, true).GetDatasourceList();

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
    e.data.cotizacionId = this.cotizacionId;
    e.data.tipoImpuesto = this.tipoImpuestoId;
  }

  validateNumber(e: any) {
    return e.value > 0;
  }
}
