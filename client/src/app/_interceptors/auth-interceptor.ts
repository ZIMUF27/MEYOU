import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PassportService } from '../_services/passport-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const passportService = inject(PassportService);
  const passport = passportService.data();

  if (passport?.access_token) {
    // Clone the request and add the authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${passport.access_token}`
      }
    });
  }

  return next(req);
};
