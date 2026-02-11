import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../_services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss'
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
  notification = this.notificationService.activeNotification;

  get icon(): string {
    switch (this.notification()?.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  onConfirm() {
    this.notificationService.handleAction(true);
  }

  onCancel() {
    this.notificationService.handleAction(false);
  }
}
