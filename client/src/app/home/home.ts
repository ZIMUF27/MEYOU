import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PassportService } from '../_services/passport-service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  passportService = inject(PassportService);

  get isLoggedIn(): boolean {
    return !!this.passportService.data()?.access_token;
  }
}
