import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenComprasComponent } from './orden-compras.component';

describe('OrdenComprasComponent', () => {
  let component: OrdenComprasComponent;
  let fixture: ComponentFixture<OrdenComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdenComprasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdenComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
