import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordConfirmationPopupComponent } from './password-confirmation-popup.component';

describe('PasswordConfirmationPopupComponent', () => {
  let component: PasswordConfirmationPopupComponent;
  let fixture: ComponentFixture<PasswordConfirmationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasswordConfirmationPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordConfirmationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
