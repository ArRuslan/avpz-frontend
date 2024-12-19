import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OpenApiService } from 'src/app/services/open-api.service';
import { userInfo } from 'os';

@Component({
  selector: 'app-mfa-setup',
  templateUrl: './mfa-setup.component.html',
  styleUrls: ['./mfa-setup.component.scss']
})
export class MfaSetupComponent implements OnInit {  
  secretKey: string = '';
  qrCodeUrl: string = '';
  verificationCode: string = '';
  password: string = '';
  mfaEnabled: boolean = (localStorage.getItem('mfa_enabled') === 'true') || false;
  email: string = localStorage.getItem('email') || '';
  otpAuthUrl: string = '';
  

  constructor(
    private openApiService: OpenApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.secretKey = this.generateRandomCode(this.email);
    this.otpAuthUrl = `otpauth://totp/${this.email}?secret=${this.secretKey}&issuer=HHB`;
    this.generateQrCode();
  }

  generateQrCode(): void {
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      this.otpAuthUrl
    )}&size=200x200`;
  }

  
  submitCode(): void {
    if (this.verificationCode.length === 6 && this.password.length >= 8) {
      if(localStorage.getItem('mfa_enabled') === "false"){
        console.log(1);
        this.openApiService.enableMfa(this.password, this.secretKey, this.verificationCode).subscribe({
          next: (response) => {
            this.showToast('2FA successfully activated', 'success');
            this.router.navigate(['/my-profile']);
          },
          error: (err) => {
            this.showToast('2FA activation failed', 'error');
          }
        });
      } else {
        console.log(2);
        this.openApiService.disableMfa(this.password, this.verificationCode).subscribe({
          next: (response) => {
            this.showToast('2FA successfully deactivated', 'success');
            this.router.navigate(['/my-profile']);
          },
          error: (err) => {
            this.showToast('2FA deactivation failed', 'error');
          }
        });
      }
      
    } else {
      this.showToast("Enter password and code", "error");
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type
    });
  }

  generateRandomCode(email: string): string {
    const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '');
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let emailIndex = 0;
  
    while (code.length < 16) {
      const charIndex = cleanEmail.charCodeAt(emailIndex % cleanEmail.length) % characters.length;
      code += characters[charIndex];
      
      emailIndex++;
    }

    return code;
  }

  protected readonly environment = environment;
}
