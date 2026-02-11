import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth, idToken } from '@angular/fire/auth';
import { switchMap, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  return idToken(auth).pipe(
    take(1),
    switchMap(token => {
      if (token) {
        const newReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(newReq);
      }
      return next(req);
    })
  );
};
