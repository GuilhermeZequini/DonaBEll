import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService, UsuarioLogado } from '../../services/auth.service';
import { PainelSidebarComponent, ItemMenuPainel } from '../../shared/painel-sidebar/painel-sidebar.component';

const MENU_PAINEL: ItemMenuPainel[] = [
  { label: 'Dashboard', link: '/painel', icon: 'dashboard', roles: ['GERENTE', 'VENDEDOR', 'ENTREGADOR', 'CLIENTE'] },
  { label: 'Pedidos', link: '/painel/pedidos', icon: 'pedidos', roles: ['GERENTE', 'VENDEDOR'] },
  { label: 'Produção', link: '/painel/producao', icon: 'producao', roles: ['PRODUCAO', 'GERENTE'] },
  { label: 'Entregas', link: '/painel/entregas', icon: 'entregas', roles: ['ENTREGADOR', 'GERENTE'] },
  { label: 'Rotas', link: '/painel/rotas', icon: 'rotas', roles: ['GERENTE'] },
  { label: 'Produtos', link: '/painel/produtos', icon: 'produtos', roles: ['GERENTE', 'VENDEDOR'] },
  { label: 'Clientes', link: '/painel/clientes', icon: 'clientes', roles: ['GERENTE', 'VENDEDOR'] },
  { label: 'Usuários', link: '/painel/usuarios', icon: 'usuarios', roles: ['GERENTE'] },
  { label: 'Relatórios', link: '/painel/relatorios', icon: 'relatorios', roles: ['GERENTE'] },
];

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [PainelSidebarComponent, RouterOutlet],
  template: `
    <app-painel-sidebar
      [usuario]="usuario"
      [itensMenu]="itensMenu"
      (sair)="logout()"
    />
    <main class="painel-conteudo">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrl: './painel.component.scss',
})
export class PainelComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  itensMenu: ItemMenuPainel[] = MENU_PAINEL;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
