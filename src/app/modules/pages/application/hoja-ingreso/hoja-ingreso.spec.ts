import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HojaIngreso } from './hoja-ingreso';

describe('HojaIngreso', () => {
  let component: HojaIngreso;
  let fixture: ComponentFixture<HojaIngreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HojaIngreso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HojaIngreso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
