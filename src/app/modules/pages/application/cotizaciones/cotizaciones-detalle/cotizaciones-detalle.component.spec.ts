import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotizacionesDetalleComponent } from './cotizaciones-detalle.component';

describe('CotizacionesDetalleComponent', () => {
  let component: CotizacionesDetalleComponent;
  let fixture: ComponentFixture<CotizacionesDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotizacionesDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CotizacionesDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
