import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookStepperComponent } from './book-stepper.component';

describe('BookStepperComponent', () => {
  let component: BookStepperComponent;
  let fixture: ComponentFixture<BookStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookStepperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
