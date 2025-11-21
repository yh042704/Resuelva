import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridCrudComponent } from './grid-crud.component';

describe('GridCrudComponent', () => {
  let component: GridCrudComponent;
  let fixture: ComponentFixture<GridCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridCrudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GridCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
