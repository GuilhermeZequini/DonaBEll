import { Component, OnInit } from '@angular/core';
import { ProducaoPainelService, ColunaRota, ConsolidacaoRota } from '../../../../services/producao-painel.service';

@Component({
  selector: 'app-producao-painel',
  standalone: true,
  templateUrl: './producao-painel.component.html',
  styleUrl: './producao-painel.component.scss',
})
export class ProducaoPainelComponent implements OnInit {
  colunasRotas: ColunaRota[] = [];
  consolidacao: ConsolidacaoRota[] = [];
  carregando = true;
  erro: string | null = null;
  abaAtiva: 'pedidos' | 'consolidacao' = 'pedidos';

  constructor(private service: ProducaoPainelService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = null;
    this.service.listarPorRotas().subscribe({
      next: (res) => {
        this.colunasRotas = res.por_rota ?? [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar o painel de produção.';
        this.carregando = false;
      },
    });
    this.service.getConsolidacao().subscribe({
      next: (res) => {
        this.consolidacao = res.consolidacao ?? [];
      },
      error: () => (this.consolidacao = []),
    });
  }

  marcarEmProducao(pedidoId: number): void {
    this.service.atualizarStatus(pedidoId, 'EM_PRODUCAO').subscribe({
      next: () => this.carregar(),
      error: (err) => alert(err.error?.message || 'Não foi possível atualizar.'),
    });
  }

  marcarPronto(pedidoId: number): void {
    this.service.atualizarStatus(pedidoId, 'PRONTO').subscribe({
      next: () => this.carregar(),
      error: (err) => alert(err.error?.message || 'Não foi possível atualizar.'),
    });
  }

  statusLabel(s: string): string {
    const labels: Record<string, string> = {
      APROVADO: 'Aprovado',
      EM_PRODUCAO: 'Em produção',
      PRONTO: 'Pronto',
    };
    return labels[s] ?? s;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      APROVADO: 'status-badge--aprovado',
      EM_PRODUCAO: 'status-badge--em-producao',
      PRONTO: 'status-badge--pronto',
    };
    return `status-badge ${map[status] ?? 'status-badge--default'}`;
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
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
}
