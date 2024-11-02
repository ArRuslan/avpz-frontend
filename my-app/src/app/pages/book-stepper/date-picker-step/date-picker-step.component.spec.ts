import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerStepComponent } from './date-picker-step.component';

describe('DatePickerStepComponent', () => {
  let component: DatePickerStepComponent;
  let fixture: ComponentFixture<DatePickerStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatePickerStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatePickerStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
