import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetAvatarPopupComponent } from './set-avatar-popup.component';

describe('SetAvatarPopupComponent', () => {
  let component: SetAvatarPopupComponent;
  let fixture: ComponentFixture<SetAvatarPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetAvatarPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetAvatarPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
