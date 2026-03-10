import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UsuarioLogado } from '../../../services/auth.service';
import {
  DashboardPainelService,
  RotaDashboard,
  PedidoDashboardResumo,
  SemanaDashboard,
} from '../../../services/dashboard-painel.service';

export type ModoVisualizacao = 'por_semana' | 'por_rota';

@Component({
  selector: 'app-dashboard-painel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-painel.component.html',
  styleUrl: './dashboard-painel.component.scss',
})
export class DashboardPainelComponent implements OnInit {
  usuario: UsuarioLogado | null = null;
  porRota: RotaDashboard[] = [];
  modoVisualizacao: ModoVisualizacao = 'por_rota';
  carregando = true;
  erro: string | null = null;
  ano = new Date().getFullYear();
  mes: number | null = null;
  meses = [
    { valor: null, label: 'Todos os meses' },
    { valor: 1, label: 'Janeiro' },
    { valor: 2, label: 'Fevereiro' },
    { valor: 3, label: 'Março' },
    { valor: 4, label: 'Abril' },
    { valor: 5, label: 'Maio' },
    { valor: 6, label: 'Junho' },
    { valor: 7, label: 'Julho' },
    { valor: 8, label: 'Agosto' },
    { valor: 9, label: 'Setembro' },
    { valor: 10, label: 'Outubro' },
    { valor: 11, label: 'Novembro' },
    { valor: 12, label: 'Dezembro' },
  ];

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardPainelService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario();
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = null;
    this.dashboardService.listar(this.ano, this.mes ?? undefined).subscribe({
      next: (res) => {
        this.porRota = res.por_rota ?? [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar o dashboard.';
        this.carregando = false;
      },
    });
  }

  formatarPerfil(tipo: string): string {
    if (!tipo) return '';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  formatarData(data: string | null): string {
    if (!data) return '—';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  anosDisponiveis(): number[] {
    const atual = new Date().getFullYear();
    return [atual - 2, atual - 1, atual, atual + 1];
  }

  /** Agrupa todos os pedidos apenas por semana (sem separar por rota). Cada pedido inclui rota_nome para exibição. */
  get porSemanas(): (SemanaDashboard & { pedidos: (PedidoDashboardResumo & { rota_nome?: string })[] })[] {
    const porChave: Record<string, SemanaDashboard & { pedidos: (PedidoDashboardResumo & { rota_nome?: string })[] }> = {};
    for (const bloco of this.porRota) {
      const rotaNome = bloco.rota?.nome ?? 'Sem rota';
      for (const semana of bloco.semanas) {
        const chave = semana.semana_inicio;
        if (!porChave[chave]) {
          porChave[chave] = {
            semana_inicio: semana.semana_inicio,
            semana_fim: semana.semana_fim,
            label: semana.label,
            pedidos: [],
          };
        }
        for (const p of semana.pedidos) {
          porChave[chave].pedidos.push({ ...p, rota_nome: rotaNome });
        }
      }
    }
    return Object.values(porChave).sort(
      (a, b) => a.semana_inicio.localeCompare(b.semana_inicio)
    );
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = {
      NOVO: 'Novo',
      APROVADO: 'Aprovado',
      REJEITADO: 'Rejeitado',
      EM_PRODUCAO: 'Em produção',
      PRONTO: 'Pronto',
      EM_ENTREGA: 'Em entrega',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    };
    return labels[s] ?? s;
  }
}
