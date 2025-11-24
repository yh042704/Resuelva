import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaIngresoDetalleComponent } from './hoja-ingreso-detalle.component';

describe('HojaIngresoDetalleComponent', () => {
  let component: HojaIngresoDetalleComponent;
  let fixture: ComponentFixture<HojaIngresoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HojaIngresoDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HojaIngresoDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
