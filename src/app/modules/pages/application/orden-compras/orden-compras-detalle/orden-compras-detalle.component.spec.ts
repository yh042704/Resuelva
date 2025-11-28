import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenComprasDetalleComponent } from './orden-compras-detalle.component';

describe('OrdenComprasDetalleComponent', () => {
  let component: OrdenComprasDetalleComponent;
  let fixture: ComponentFixture<OrdenComprasDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenComprasDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenComprasDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
