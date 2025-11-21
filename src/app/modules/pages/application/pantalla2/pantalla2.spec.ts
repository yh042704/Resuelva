import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pantalla2 } from './pantalla2';

describe('Pantalla2', () => {
  let component: Pantalla2;
  let fixture: ComponentFixture<Pantalla2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pantalla2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pantalla2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
