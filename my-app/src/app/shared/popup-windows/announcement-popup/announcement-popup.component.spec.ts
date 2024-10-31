import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementPopupComponent } from './announcement-popup.component';

describe('AnnouncementPopupComponent', () => {
  let component: AnnouncementPopupComponent;
  let fixture: ComponentFixture<AnnouncementPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnouncementPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
