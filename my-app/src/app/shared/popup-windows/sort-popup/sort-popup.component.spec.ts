import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortPopupComponent } from './sort-popup.component';

describe('SortPopupComponent', () => {
  let component: SortPopupComponent;
  let fixture: ComponentFixture<SortPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
