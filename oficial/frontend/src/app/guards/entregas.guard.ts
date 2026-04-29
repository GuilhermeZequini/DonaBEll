import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const entregasGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.getUsuario();

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (usuario?.tipo_perfil === 'ENTREGADOR' || usuario?.tipo_perfil === 'GERENTE') {
    return true;
  }

  router.navigate(['/painel']);
  return false;
};
