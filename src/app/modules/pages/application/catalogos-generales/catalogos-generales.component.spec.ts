import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogosGeneralesComponent } from './catalogos-generales.component';

describe('CatalogosGeneralesComponent', () => {
  let component: CatalogosGeneralesComponent;
  let fixture: ComponentFixture<CatalogosGeneralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogosGeneralesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CatalogosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
