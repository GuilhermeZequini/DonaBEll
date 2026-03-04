import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService, UsuarioLogado } from '../../services/auth.service';
import { PainelSidebarComponent, ItemMenuPainel } from '../../shared/painel-sidebar/painel-sidebar.component';

const MENU_PAINEL: ItemMenuPainel[] = [
  { label: 'Dashboard', link: '/painel', icon: 'dashboard' },
  { label: 'Pedidos', link: '/painel/pedidos', icon: 'pedidos' },
  { label: 'Produção', link: '/painel/producao', icon: 'producao' },
  { label: 'Rotas', link: '/painel/rotas', icon: 'rotas', roles: ['GERENTE'] },
  { label: 'Produtos', link: '/painel/produtos', icon: 'produtos' },
  { label: 'Clientes', link: '/painel/clientes', icon: 'clientes' },
  { label: 'Usuários', link: '/painel/usuarios', icon: 'usuarios', roles: ['GERENTE'] },
  { label: 'Relatórios', link: '/painel/relatorios', icon: 'relatorios' },
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
