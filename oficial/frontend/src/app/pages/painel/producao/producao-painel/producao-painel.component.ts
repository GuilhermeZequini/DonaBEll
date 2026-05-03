import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ProducaoPainelService,
  SemanaProducao,
  ConsolidacaoSemanaBloco,
} from '../../../../services/producao-painel.service';

@Component({
  selector: 'app-producao-painel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './producao-painel.component.html',
  styleUrl: './producao-painel.component.scss',
})
export class ProducaoPainelComponent implements OnInit {
  /** Por semana: só APROVADO + EM_PRODUCAO; rotas sem pedidos na fila são omitidas. */
  semanasFila: SemanaProducao[] = [];
  /** Por semana: só PRONTO */
  semanasProntos: SemanaProducao[] = [];
  /** Consolidação: uma entrada por semana (mais recente primeiro). */
  consolidacaoSemanas: ConsolidacaoSemanaBloco[] = [];
  /** Quantas semanas exibir (1 = só a atual; máx. 26). */
  nSemanasConsolidacao = 1;
  carregandoConsolidacao = false;
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
        const semanas = res.por_semana ?? [];
        this.semanasFila = semanas
          .map((s) => ({
            ...s,
            por_rota: s.por_rota
              .map((col) => ({
                ...col,
                pedidos: col.pedidos.filter((p) => p.status !== 'PRONTO'),
              }))
              .filter((col) => col.pedidos.length > 0),
          }))
          .filter((s) => s.por_rota.length > 0);

        this.semanasProntos = semanas
          .map((s) => ({
            ...s,
            por_rota: s.por_rota
              .map((col) => ({
                ...col,
                pedidos: col.pedidos.filter((p) => p.status === 'PRONTO'),
              }))
              .filter((col) => col.pedidos.length > 0),
          }))
          .filter((s) => s.por_rota.length > 0);

        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar o painel de produção.';
        this.carregando = false;
      },
    });
    this.recarregarConsolidacao();
  }

  recarregarConsolidacao(): void {
    this.carregandoConsolidacao = true;
    this.service.getConsolidacao(this.nSemanasConsolidacao).subscribe({
      next: (res) => {
        this.consolidacaoSemanas = res.semanas ?? [];
        this.carregandoConsolidacao = false;
      },
      error: () => {
        this.consolidacaoSemanas = [];
        this.carregandoConsolidacao = false;
      },
    });
  }

  onMudarNSemanasConsolidacao(): void {
    const bruto = Number(this.nSemanasConsolidacao);
    const n = Math.min(26, Math.max(1, Math.floor(Number.isFinite(bruto) ? bruto : 1)));
    this.nSemanasConsolidacao = n;
    this.recarregarConsolidacao();
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

  totalPedidosProntos(): number {
    return this.semanasProntos.reduce(
      (acc, s) => acc + s.por_rota.reduce((a2, c) => a2 + c.pedidos.length, 0),
      0
    );
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
