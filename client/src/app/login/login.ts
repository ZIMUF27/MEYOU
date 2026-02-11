import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../_services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  errorFromServer = signal('');
  showErrorAlert = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loginErrorMsg = {
    email: signal(''),
    password: signal(''),
  };

  constructor() {}

  closeErrorAlert() {
    this.showErrorAlert.set(false);
  }

  updateLoginErrorMsg(field: 'email' | 'password') {
    const ctrl = this.loginForm.get(field);
    if (!ctrl) return;
    
    let msg = '';
    if (ctrl.hasError('required')) msg = 'Required';
    else if (ctrl.hasError('email')) msg = 'Invalid email';
    
    this.loginErrorMsg[field].set(msg);
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.login(email!, password!);
      await this.router.navigate(['/profile']);
    } catch (error: any) {
      console.error('Login error:', error);
      this.errorFromServer.set(error.message || 'Login failed');
      this.showErrorAlert.set(true);
    }
  }

  async onGoogleLogin() {
    try {
      const userCredential = await this.auth.loginWithGoogle();
      const user = userCredential.user;
      await this.auth.createUserProfile(user.uid, user.email || '', 'user');
      await this.router.navigate(['/profile']);
    } catch (error: any) {
      console.error('Google Login error:', error);
      this.errorFromServer.set(error.message || 'Google Login failed');
      this.showErrorAlert.set(true);
    }
  }
}
