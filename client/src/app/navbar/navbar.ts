import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AuthService } from '../_services/auth-service'
import { toSignal } from '@angular/core/rxjs-interop'
import { NotificationService } from '../_services/notification.service'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  showMenu = false
  auth = inject(AuthService)
  notification = inject(NotificationService)
  user = toSignal(this.auth.user$)

  get isLoggedIn(): boolean {
    return !!this.user();
  }

  get currentUser() {
    const u = this.user();
    return u ? { display_name: u.displayName || u.email, ...u } : null;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu
  }

  closeMenu() {
    this.showMenu = false
  }

  async logout() {
    const confirmed = await this.notification.confirm({
      message: 'Are you sure you want to log out of your account?',
      title: 'SYSTEM ALERT',
      type: 'warning',
      confirmText: 'LOGOUT',
      cancelText: 'CANCEL'
    });

    if (confirmed) {
      this.auth.logout();
      this.closeMenu();
    }
  }
}
