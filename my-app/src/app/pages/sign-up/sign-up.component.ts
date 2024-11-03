import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

interface SignIn {
  token: string;
}

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  captchaKey: string | null = null;
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      this.sendGoogleCallbackParams(code, state);
    }
  }
  sendGoogleCallbackParams(code: string, state: string) {
    const requestBody = { code, state };
    this.http.post<{ token: string }>(`${environment.apiBaseUrl}/auth/google/callback`, requestBody).subscribe({
      next: (response) => {
        console.log('Google callback response:', response);
        localStorage.setItem('token', response.token);
      },
      error: (error) => {
        console.error('Google callback failed', error);
      }
    });
  }
  recaptchaResolved(response: string) {
    console.log(`Resolved captcha with response: ${response}`);
    this.captchaKey = response;
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: any,
    address: string,
    city: string,
    country: string,
    postalCode: any
  ): void {
    if (!this.captchaKey) {
      console.error('Captcha not resolved');
      return;
    }

    const requestBody = {
      email: email,
      password: password,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      address: address,
      city: city,
      country: country,
      postal_code: postalCode,
      captcha_key: this.captchaKey
    };

    this.http.post<SignIn>(`${environment.apiBaseUrl}/auth/register`, requestBody).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        localStorage.setItem('token', response.token);
        console.log(response.token);
        this.router.navigate(['/main-page']);
      },
      error: (error) => {
        console.error('Registration failed', error);
      }
    });
  }



  RegisterWithGoogle() {
    this.http.get<{ url: string }>(`${environment.apiBaseUrl}/auth/google`).subscribe({
      next: (response) => {
        console.log('URL for Google login:', response.url);
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Google login failed', error);
      }
    });
  }

  protected readonly environment = environment;
}
