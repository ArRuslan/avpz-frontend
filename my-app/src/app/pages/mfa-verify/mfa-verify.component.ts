import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mfa-verify',
  templateUrl: './mfa-verify.component.html',
  styleUrls: ['./mfa-verify.component.scss']
})
export class MfaVerifyComponent implements OnInit {
  mfaForm: FormGroup;
  mfaCode: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.mfaForm = this.fb.group({
      mfaCode: ['', Validators.required, Validators.minLength(6)]
    });
  }

  ngOnInit(): void {
  }


  verifyMfaCode(): void {
    const mfaBody = {
      mfa_code: this.mfaCode,
      mfa_token: localStorage.getItem('mfa_token')
    };
    console.log(this.mfaCode);
    
    this.http.post<{ token: string }>(`${environment.apiBaseUrl}/auth/login/mfa`, mfaBody).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.router.navigate(['/main-page']);
        this.showToast('Login successful', 'success');
      },
      error: (err) => {
        this.showToast('MFA verification failed', 'error');
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
