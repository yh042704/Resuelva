import { Component, ViewChild } from '@angular/core';
import GridCrudComponent from '../../../shared/grid-crud/grid-crud.component';

@Component({
  selector: 'app-hoja-ingreso',
  standalone: true,
  imports: [],
  templateUrl: './hoja-ingreso.html',
  styleUrl: './hoja-ingreso.scss'
})
export default class HojaIngreso {
  @ViewChild(GridCrudComponent) gridCrudComponent?: GridCrudComponent;

}
