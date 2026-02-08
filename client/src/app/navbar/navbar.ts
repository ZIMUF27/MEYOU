import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PassportService } from '../_services/passport-service'

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatButtonModule, CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  showMenu = false
  passportService = inject(PassportService)

  get isLoggedIn(): boolean {
    return !!this.passportService.data()?.access_token
  }

  get currentUser() {
    return this.passportService.data()
  }

  toggleMenu() {
    this.showMenu = !this.showMenu
  }

  closeMenu() {
    this.showMenu = false
  }
}
