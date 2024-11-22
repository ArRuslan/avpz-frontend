import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  private apiUrl: string = 'https://hhb-testing.ruslan.page';

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      const loginData = {
        captcha_key: 'for-now-this-field-is-not-empty-for-backward-compatibility-reasons',
        email: email,
        password: password
      };

      this.http.post(`${this.apiUrl}/auth/login`, loginData).subscribe(
        (response: any) => {
          // Перевіряємо, чи токен існує
          if (response && response.token) {
            localStorage.setItem('isAdminLoggedIn', 'true');
            this.router.navigate(['/admin']);
          } else {
            alert('Authentication failed: Token not received');
          }
        },
        error => {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        }
      );
    }
  }
}
