import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UsuarioLogado } from '../../services/auth.service';

export type IconeMenu =
  | 'dashboard'
  | 'pedidos'
  | 'producao'
  | 'rotas'
  | 'produtos'
  | 'clientes'
  | 'usuarios'
  | 'relatorios';

export interface ItemMenuPainel {
  label: string;
  link: string;
  icon?: IconeMenu;
  /** Se definido, o item só aparece para estes perfis (ex: ['GERENTE']) */
  roles?: string[];
}

@Component({
  selector: 'app-painel-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './painel-sidebar.component.html',
  styleUrl: './painel-sidebar.component.scss',
})
export class PainelSidebarComponent {
  @Input() usuario: UsuarioLogado | null = null;
  @Input() itensMenu: ItemMenuPainel[] = [];
  @Output() sair = new EventEmitter<void>();

  formatarPerfil(tipo: string): string {
    if (!tipo) return '';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  itensVisiveis(): ItemMenuPainel[] {
    if (!this.usuario) return [];
    const perfil = this.usuario.tipo_perfil;
    return this.itensMenu.filter(
      (item) => !item.roles || item.roles.length === 0 || item.roles.includes(perfil)
    );
  }

  onSair(): void {
    this.sair.emit();
  }

  inicialNome(): string {
    if (!this.usuario?.nome?.trim()) return '?';
    return this.usuario.nome.trim().charAt(0).toUpperCase();
  }
}
