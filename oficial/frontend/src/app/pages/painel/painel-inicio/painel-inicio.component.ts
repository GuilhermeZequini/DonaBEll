import { Component, OnInit } from '@angular/core';
import { AuthService, UsuarioLogado } from '../../../services/auth.service';

@Component({
  selector: 'app-painel-inicio',
  standalone: true,
  imports: [],
  template: `
    @if (usuario) {
      <section class="painel-bemvindo">
        <h1 class="painel-bemvindo__titulo">Bem-vindo, {{ usuario.nome }}</h1>
        <p class="painel-bemvindo__perfil">{{ formatarPerfil(usuario.tipo_perfil) }}</p>
      </section>
    } @else {
      <p class="painel-aviso">Carregando...</p>
    }
  `,
  styles: [
    `
      .painel-bemvindo {
        background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
        border-radius: 12px;
        padding: 2rem;
        border: 1px solid #eee;
      }
      .painel-bemvindo__titulo {
        margin: 0 0 0.5rem 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #333;
      }
      .painel-bemvindo__perfil {
        margin: 0;
        font-size: 1rem;
        color: #666;
        font-weight: 500;
      }
      .painel-aviso {
        color: #666;
      }
    `,
  ],
})
export class PainelInicioComponent implements OnInit {
  usuario: UsuarioLogado | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
  }

  formatarPerfil(tipo: string): string {
    if (!tipo) return '';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }
}
