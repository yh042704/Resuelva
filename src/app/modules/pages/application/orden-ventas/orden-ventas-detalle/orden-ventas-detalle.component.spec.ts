import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenVentasDetalleComponent } from './orden-ventas-detalle.component';

describe('OrdenVentasDetalleComponent', () => {
  let component: OrdenVentasDetalleComponent;
  let fixture: ComponentFixture<OrdenVentasDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenVentasDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenVentasDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
