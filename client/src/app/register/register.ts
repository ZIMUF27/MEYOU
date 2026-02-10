import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatCheckboxModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  errorFromServer = signal('');
  showErrorAlert = signal(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    cf_password: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  registerErrorMsg = {
    email: signal(''),
    password: signal(''),
    cf_password: signal('')
  };

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const cf_password = control.get('cf_password');
    if (password && cf_password && password.value !== cf_password.value) {
      cf_password.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  updateRegisterErrorMsg(field: 'email' | 'password' | 'cf_password') {
    const ctrl = this.registerForm.get(field);
    if (!ctrl) return;
    
    let msg = '';
    if (ctrl.hasError('required')) msg = 'Required';
    else if (ctrl.hasError('email')) msg = 'Invalid email';
    else if (ctrl.hasError('minlength')) msg = 'Min length 6';
    else if (ctrl.hasError('mismatch')) msg = 'Passwords do not match';
    
    this.registerErrorMsg[field].set(msg);
  }

  closeErrorAlert() {
    this.showErrorAlert.set(false);
  }

  async onRegister() {
    if (this.registerForm.invalid) return;
    try {
      const { email, password } = this.registerForm.getRawValue();
      const credential = await this.auth.register(email!, password!);
      if (credential.user) {
        await this.auth.createUserProfile(credential.user.uid, email!, 'user');
      }
      await this.router.navigate(['/']);
    } catch (error: any) {
      this.errorFromServer.set(error.message || 'Registration failed');
      this.showErrorAlert.set(true);
    }
  }
}
