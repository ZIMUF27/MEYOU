import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../_services/auth-service';

export const logoutGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  auth.logout();
  router.navigate(['/']);
  return false;
}
