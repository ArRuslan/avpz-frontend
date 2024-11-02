import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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

  login(email: string, password: string) {
    if (!this.captchaKey) {
      console.error('Captcha not resolved');
      return;
    }

    const requestBody = {
      email: email,
      password: password,
      captcha_key: this.captchaKey
    };

    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, requestBody).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('token', response.token);
        console.log(response.token);
        this.router.navigate(['/main-page']);
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });

  }
  loginWithGoogle() {
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
