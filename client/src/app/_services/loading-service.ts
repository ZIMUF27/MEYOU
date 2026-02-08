import { Injectable, inject } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private spinner = inject(NgxSpinnerService);

  loading() {
    this.spinner.show();
  }

  idle() {
    this.spinner.hide();
  }
}
