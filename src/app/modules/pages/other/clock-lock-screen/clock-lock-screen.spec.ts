import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockLockScreen } from './clock-lock-screen';

describe('ClockLockScreen', () => {
  let component: ClockLockScreen;
  let fixture: ComponentFixture<ClockLockScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockLockScreen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockLockScreen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
