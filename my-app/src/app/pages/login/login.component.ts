import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  captchaKey: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

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
        localStorage.setItem('token', response.token);
        this.showToast('Google login successful', 'success');
      },
      error: () => {
        this.showToast('Google login failed', 'error');
      }
    });
  }

  recaptchaResolved(response: string) {
    this.captchaKey = response;
  }

  login(): void {
    if (!this.captchaKey) {
      this.showToast('Please complete the captcha', 'error');
      return;
    }
    if (this.loginForm.invalid) {
      this.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    const requestBody = {
      ...this.loginForm.value,
      captcha_key: this.captchaKey
    };

    this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, requestBody).subscribe({
      next: (response) => {
        if(response.token){
          localStorage.setItem('token', response.token);
          this.router.navigate(['/main-page']);
          this.showToast('Login successful', 'success');
        }
      },
      error: (err) => {
        if(err.error.mfa_token) {
          localStorage.setItem('mfa_token', err.error.mfa_token);
          this.router.navigate(['/mfa-verify']);
        }
        else this.showToast(err.message, 'error');
      }
    });
  }

  loginWithGoogle() {
    this.http.get<{ url: string }>(`${environment.apiBaseUrl}/auth/google`).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: () => {
        this.showToast('Failed to connect with Google', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type
    });
  }

  protected readonly environment = environment;
}
