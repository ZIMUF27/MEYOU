import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSignal = signal<NotificationOptions | null>(null);
  private resolveCallback: ((value: boolean) => void) | null = null;

  activeNotification = this.notificationSignal.asReadonly();

  showAlert(message: string, title: string = 'SYSTEM ALERT', type: NotificationType = 'info') {
    this.notificationSignal.set({
      title,
      message,
      type,
      showCancel: false,
      confirmText: 'OK'
    });
  }

  confirm(options: NotificationOptions): Promise<boolean> {
    this.notificationSignal.set({
      title: options.title || 'CONFIRMATION',
      message: options.message,
      type: options.type || 'warning',
      showCancel: true,
      confirmText: options.confirmText || 'YES',
      cancelText: options.cancelText || 'NO'
    });

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  handleAction(confirmed: boolean) {
    this.notificationSignal.set(null);
    if (this.resolveCallback) {
      this.resolveCallback(confirmed);
      this.resolveCallback = null;
    }
  }
}
