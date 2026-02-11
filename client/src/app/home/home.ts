import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../_services/auth-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  auth = inject(AuthService);
  user = toSignal(this.auth.user$);

  get isLoggedIn(): boolean {
    return !!this.user();
  }
}
