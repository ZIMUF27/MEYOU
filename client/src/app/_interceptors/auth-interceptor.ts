import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PassportService } from '../_services/passport-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const passportService = inject(PassportService);
  const passport = passportService.data();

  const token = passport?.access_token ?? (passport as any)?.token;
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
