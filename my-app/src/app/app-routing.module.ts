import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailComponent } from './pages/event-detail/event-detail.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { LoginComponent } from './pages/login/login.component';
import {MyProfileComponent} from "./pages/my-profile/my-profile.component";

const routes: Routes = [
  { path: 'main-page', component: MainPageComponent },
  { path: 'events', component: EventsComponent },
  { path: 'events/:category', component: EventsComponent },
  { path: 'event/:event_id', component: EventDetailComponent },
  { path: 'about_us', component: AboutUsComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'sign_up', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: MyProfileComponent },
  { path: '', redirectTo: '/main-page', pathMatch: 'full' },
  { path: '**', redirectTo: '/main-page' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
