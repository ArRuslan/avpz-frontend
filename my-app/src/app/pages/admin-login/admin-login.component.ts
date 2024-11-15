import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // Замініть перевірку облікових даних на реальну логіку аутентифікації
      if (email === 'admin@example.com' && password === 'admin') {
        localStorage.setItem('isAdminLoggedIn', 'true');
        this.router.navigate(['/admin']);
      } else {
        alert('Invalid login credentials');
      }
    }
  }
}
