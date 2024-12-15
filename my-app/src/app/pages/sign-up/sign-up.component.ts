import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {environment} from "../../../environments/environment";

interface SignIn {
  token: string;
}


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  signUpForm: FormGroup;
  captchaKey: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.signUpForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.pattern(/^\+?[0-9]*$/)]],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
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

  register(): void {
    if (!this.captchaKey) {
      console.log(1)
      this.showToast('Please complete the captcha', 'error');
      return;
    }
    if (this.signUpForm.invalid) {
      console.log(2)
      this.showToast('Please fill all required fields correctly', 'error');
      return;
    }

    const requestBody = {
      ...this.signUpForm.value,
      captcha_key: this.captchaKey
    };

    this.http.post<SignIn>(`${environment.apiBaseUrl}/auth/register`, requestBody).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/main-page']);
        this.showToast('Registration successful', 'success');
      },
      error: () => {
        this.showToast('Registration failed', 'error');
      }
    });
  }

  RegisterWithGoogle() {
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
    console.log("WORK")
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type
    });
  }
  protected readonly environment = environment;
}

