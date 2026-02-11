import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, Profile } from '../_services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent {
  auth = inject(AuthService);
  router = inject(Router);

  // Signals
  currentUser = this.auth.currentUser;
  userProfile = this.auth.userProfile;

  // Local state for editing
  newNickname = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  // UI State
  uploading = signal(false);
  uploadMessage = signal<string | null>(null);

  constructor() {
    // Effect to redirect if not logged in
    effect(() => {
      if (!this.currentUser()) {
        this.router.navigate(['/login']);
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'https://www.w3schools.com/howto/img_avatar.png';
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async createOrUpdateProfile() {
    if (!this.currentUser()) return;

    // Validation: Need a nickname if one doesn't exist
    const currentName = this.userProfile()?.display_name;
    const nameToSave = this.newNickname.trim() || currentName;

    if (!nameToSave) {
        this.uploadMessage.set('Please set a nickname.');
        return;
    }

    this.uploading.set(true);
    this.uploadMessage.set(null);

    try {
      const uid = this.currentUser()!.uid;
      let avatarUrl = this.userProfile()?.avatar_url;

      // 1. Try to upload avatar if selected
      if (this.selectedFile) {
        try {
          avatarUrl = await this.auth.uploadUserAvatar(uid, this.selectedFile);
        } catch (err: any) {
          console.error('Upload failed:', err);
          this.uploadMessage.set('Avatar upload failed. Saving other details...');
        }
      }

      // 2. Update Firestore profile
      await this.auth.updateUserProfile(uid, {
        display_name: nameToSave,
        avatar_url: avatarUrl || null,
        level: this.userProfile()?.level || 1,
        xp: this.userProfile()?.xp || 0
      });

      this.uploadMessage.set('Profile saved successfully!');

      // Clear inputs
      this.selectedFile = null;
      this.newNickname = '';

    } catch (error: any) {
      console.error(error);
      this.uploadMessage.set('Error: ' + error.message);
    } finally {
      this.uploading.set(false);
    }
  }

  logout() {
    if (confirm('Are you sure you want to log out of your account?')) {
      this.auth.logout();
    }
  }

  // Helper for date formatting in template
  formatDate(timestamp: any): string {
    if (!timestamp) return 'Unknown';
    // Handle Firestore Timestamp
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}