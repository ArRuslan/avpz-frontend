import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomPickStepComponent } from './room-pick-step.component';

describe('RoomPickStepComponent', () => {
  let component: RoomPickStepComponent;
  let fixture: ComponentFixture<RoomPickStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomPickStepComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomPickStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
