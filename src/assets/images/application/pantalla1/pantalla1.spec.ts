import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pantalla1 } from './pantalla1';

describe('Pantalla1', () => {
  let component: Pantalla1;
  let fixture: ComponentFixture<Pantalla1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pantalla1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pantalla1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
