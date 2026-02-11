import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { AuthService } from '../_services/auth-service'
import { toSignal } from '@angular/core/rxjs-interop'

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  showMenu = false
  auth = inject(AuthService)
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

  logout() {
    if (confirm('Are you sure you want to log out of your account?')) {
      this.auth.logout();
      this.closeMenu();
    }
  }
}