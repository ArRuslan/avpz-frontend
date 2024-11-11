import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../../environments/environment";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetRequestForm: FormGroup;
  passwordResetForm: FormGroup;
  captchaKey: string | null = null;
  isTokenPresent: boolean = false;
  resetToken: string | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetRequestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordResetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['reset-token'];
      this.isTokenPresent = !!this.resetToken;
    });
  }

  recaptchaResolved(response: string) {
    this.captchaKey = response;
  }

  requestPasswordReset(): void {
    if (!this.captchaKey) {
      this.showToast('Please complete the captcha', 'error');
      return;
    }
    if (this.resetRequestForm.invalid) {
      this.showToast('Please enter a valid email address', 'error');
      return;
    }

    const requestBody = {
      email: this.resetRequestForm.value.email,
      captcha_key: this.captchaKey
    };

    this.http.post(`${environment.apiBaseUrl}/auth/reset-password/request`, requestBody, { observe: 'response' }).subscribe({
      next: (response) => {
        const token = response.headers.get('X-Debug-Token');
        console.log(response)
        console.log('TOKEN', token)
        if (token) {
          this.resetToken = token;
          this.isTokenPresent = true;
          this.showToast('Reset link sent successfully', 'success');
        } else {
          this.showToast('Failed to retrieve reset token', 'error');
        }
      },
      error: () => {
        this.showToast('Failed to send reset link', 'error');
      }
    });
  }

  resetPassword(): void {
    if (this.passwordResetForm.invalid) {
      this.showToast('Please enter a valid password', 'error');
      return;
    }
    if (!this.resetToken) {
      this.showToast('Invalid or missing reset token', 'error');
      return;
    }

    const requestBody = {
      new_password: this.passwordResetForm.value.password,
      reset_token: this.resetToken
    };

    this.http.post(`${environment.apiBaseUrl}/auth/reset-password/reset`, requestBody).subscribe({
      next: () => {
        this.showToast('Password reset successfully', 'success');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.showToast('Failed to reset password', 'error');
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
