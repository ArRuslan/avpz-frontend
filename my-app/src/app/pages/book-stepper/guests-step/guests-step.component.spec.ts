import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestsStepComponent } from './guests-step.component';

describe('GuestsStepComponent', () => {
  let component: GuestsStepComponent;
  let fixture: ComponentFixture<GuestsStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuestsStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
