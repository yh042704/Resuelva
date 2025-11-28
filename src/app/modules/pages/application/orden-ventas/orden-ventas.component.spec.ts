import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenVentasComponent } from './orden-ventas.component';

describe('OrdenVentasComponent', () => {
  let component: OrdenVentasComponent;
  let fixture: ComponentFixture<OrdenVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenVentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
