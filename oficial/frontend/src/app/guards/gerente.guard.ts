import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const gerenteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.getUsuario();
  if (auth.isAuthenticated() && usuario?.tipo_perfil === 'GERENTE') {
    return true;
  }
  router.navigate(['/painel']);
  return false;
};
