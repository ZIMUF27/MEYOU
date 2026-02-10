import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { PassportService } from '../_services/passport-service';
import { AuthService } from '../_services/auth-service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private passportService = inject(PassportService);
  private router = inject(Router);
  private auth = inject(AuthService);

  mode: 'login' | 'register' = 'login';

  errorFromServer = signal('');
  showErrorAlert = signal(false);

  errorMsg = {
    username: signal(''),
    password: signal(''),
    cf_password: signal(''),
    displayname: signal(''),
  };

  form = this.fb.group(
    {
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      cf_password: [''],
      display_name: [''],
    },
    {
      validators: (group) => {
        if (this.mode === 'login') return null;
        const pw = group.get('password')?.value;
        const cf = group.get('cf_password')?.value;
        if (!pw || !cf) return null;
        return pw === cf ? null : { mismatch: true };
      },
    }
  );

  firebaseEmail = '';
  firebasePassword = '';

  constructor() {
    this.applyModeValidators();
  }

  toggleMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.applyModeValidators();
    this.form.reset();
    this.resetErrors();
  }

  closeErrorAlert() {
    this.showErrorAlert.set(false);
  }

  updateErrorMsg(field: 'username' | 'password' | 'cf_password' | 'displayname') {
    const controlName = field === 'displayname' ? 'display_name' : field;
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;

    const errors = ctrl.errors || (controlName === 'cf_password' ? this.form.errors : null);
    let msg = '';

    if (errors?.['required']) msg = 'Required';
    else if (errors?.['minlength']) msg = 'Min ' + errors['minlength'].requiredLength + ' characters';
    else if (errors?.['mismatch']) msg = 'Passwords do not match';

    this.errorMsg[field].set(msg);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.updateErrorMsg('username');
      this.updateErrorMsg('password');
      if (this.mode !== 'login') {
        this.updateErrorMsg('cf_password');
        this.updateErrorMsg('displayname');
      }
      return;
    }

    this.resetErrors();

    const value = this.form.getRawValue();

    let error: string | null = null;
    if (this.mode === 'login') {
      error = await this.passportService.login({
        username: value.username,
        password: value.password,
      });
    } else {
      error = await this.passportService.register({
        username: value.username,
        password: value.password,
        cf_password: value.cf_password,
        display_name: value.display_name,
      });
    }

    if (error) {
      this.errorFromServer.set(error);
      this.showErrorAlert.set(true);
      return;
    }

    await this.router.navigate(['/']);
  }

    async firebaseRegister() {
    this.resetErrors();
    const email = this.firebaseEmail?.trim();
    const password = this.firebasePassword;

    if (!email) {
      this.errorFromServer.set('Please enter a valid email address');
      this.showErrorAlert.set(true);
      return;
    }

    try {
      const credential = await this.auth.register(email, password);
      if (credential.user) {
        // Use email prefix as default name
        const name = email.split('@')[0];
        await this.auth.createUserProfile(credential.user.uid, email, name);
      }
      
      this.errorFromServer.set('Firebase register success');
      this.showErrorAlert.set(true);
      // Optional: Auto login or redirect
      await this.router.navigate(['/']);
    } catch (e: any) {
      console.error('Firebase Register Error:', e);
      this.errorFromServer.set(e?.message ?? 'Firebase register failed');
      this.showErrorAlert.set(true);
    }
  }

  async firebaseLogin() {
    this.resetErrors();
    const email = this.firebaseEmail?.trim();
    const password = this.firebasePassword;

    if (!email) {
      this.errorFromServer.set('Please enter a valid email address');
      this.showErrorAlert.set(true);
      return;
    }

    try {
      await this.auth.login(email, password);
      this.errorFromServer.set('Firebase login success');
      this.showErrorAlert.set(true);
      await this.router.navigate(['/']);
    } catch (e: any) {
      console.error('Firebase Login Error:', e);
      this.errorFromServer.set(e?.message ?? 'Firebase login failed');
      this.showErrorAlert.set(true);
    }
  }

  async firebaseGoogleLogin() {
    this.resetErrors();
    try {
      const credential = await this.auth.googleLogin();
      if (credential.user) {
        // For Google login, we can get displayName and photoURL
        await this.auth.createUserProfile(
          credential.user.uid, 
          credential.user.email ?? '', 
          credential.user.displayName ?? 'Unknown',
          credential.user.photoURL ?? ''
        );
      }
      this.errorFromServer.set('Firebase Google login success');
      this.showErrorAlert.set(true);
      await this.router.navigate(['/']);
    } catch (e: any) {
      this.errorFromServer.set(e?.message ?? 'Firebase Google login failed');
      this.showErrorAlert.set(true);
    }
  }

  private resetErrors() {
    this.errorFromServer.set('');
    this.showErrorAlert.set(false);
    this.errorMsg.username.set('');
    this.errorMsg.password.set('');
    this.errorMsg.cf_password.set('');
    this.errorMsg.displayname.set('');
  }

  private applyModeValidators() {
    const cf = this.form.get('cf_password');
    const dn = this.form.get('display_name');

    if (!cf || !dn) return;

    if (this.mode === 'login') {
      cf.clearValidators();
      dn.clearValidators();
      cf.disable({ emitEvent: false });
      dn.disable({ emitEvent: false });
    } else {
      cf.setValidators([Validators.required]);
      dn.setValidators([Validators.required]);
      cf.enable({ emitEvent: false });
      dn.enable({ emitEvent: false });
    }

    cf.updateValueAndValidity({ emitEvent: false });
    dn.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }
}

