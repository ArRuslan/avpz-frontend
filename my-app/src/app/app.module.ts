import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RecaptchaModule} from "ng-recaptcha";
import {HttpClientModule} from '@angular/common/http';
import { NgxPayPalModule } from 'ngx-paypal';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {EventsComponent} from './pages/events/events.component';
import {EventDetailComponent} from './pages/event-detail/event-detail.component';
import {AboutUsComponent} from './pages/about-us/about-us.component';
import {ContactsComponent} from './pages/contacts/contacts.component';
import {SignUpComponent} from './pages/sign-up/sign-up.component';
import {LoginComponent} from './pages/login/login.component';
import {NavBarComponent} from './shared/nav-bar/nav-bar.component';
import {MyProfileComponent} from './pages/my-profile/my-profile.component';
import {FilterPopupComponent} from './shared/popup-windows/filter-popup/filter-popup.component';
import {SortPopupComponent} from './shared/popup-windows/sort-popup/sort-popup.component';
import {MatDialogModule} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HeaderComponent} from './shared/header/shared/header/header.component';
import {FooterComponent} from './shared/footer/shared/footer/footer.component';
import {AnnouncementPopupComponent} from './shared/popup-windows/announcement-popup/announcement-popup.component';
import {PasswordConfirmationPopupComponent} from './shared/popup-windows/password-confirmation-popup/password-confirmation-popup.component';
import {SetAvatarPopupComponent} from './shared/popup-windows/set-avatar-popup/set-avatar-popup.component';
import { HotelPageComponent } from './pages/hotel-page/hotel-page.component';
import { BookStepperComponent } from './pages/book-stepper/book-stepper.component';
import { GuestsStepComponent } from './pages/book-stepper/guests-step/guests-step.component';
import { DatePickerStepComponent } from './pages/book-stepper/date-picker-step/date-picker-step.component';
import { RoomPickStepComponent } from './pages/book-stepper/room-pick-step/room-pick-step.component';
import { ConfirmationStepComponent } from './pages/book-stepper/confirmation-step/confirmation-step.component';
import {MatSnackBarModule} from "@angular/material/snack-bar";
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    EventsComponent,
    EventDetailComponent,
    AboutUsComponent,
    ContactsComponent,
    SignUpComponent,
    LoginComponent,
    NavBarComponent,
    MyProfileComponent,
    FilterPopupComponent,
    SortPopupComponent,
    HeaderComponent,
    FooterComponent,
    AnnouncementPopupComponent,
    PasswordConfirmationPopupComponent,
    SetAvatarPopupComponent,
    HotelPageComponent,
    BookStepperComponent,
    GuestsStepComponent,
    DatePickerStepComponent,
    RoomPickStepComponent,
    ConfirmationStepComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RecaptchaModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    FormsModule,
    NgxPayPalModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
