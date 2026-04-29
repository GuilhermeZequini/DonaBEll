import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Bloqueia acesso para perfil PRODUCAO.
 * Usado em telas que não devem ser vistas/acionadas pela Produção.
 */
export const notProducaoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.getUsuario();

  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (usuario?.tipo_perfil === 'PRODUCAO') {
    router.navigate(['/painel/producao']);
    return false;
  }

  return true;
};

