import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PassportService } from '../_services/passport-service';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  passport = inject(PassportService);
  uploading = signal(false);
  uploadMessage = signal<string | null>(null);

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploading.set(true);
      this.uploadMessage.set(null);
      
      const result = await this.passport.uploadAvatar(file);
      
      if (result) {
        this.uploadMessage.set(result);
        setTimeout(() => this.uploadMessage.set(null), 5000);
      } else {
        this.uploadMessage.set('Avatar uploaded successfully!');
        setTimeout(() => this.uploadMessage.set(null), 3000);
      }
      
      this.uploading.set(false);
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }

  triggerFileInput() {
    document.getElementById('fileInput')?.click();
  }
}