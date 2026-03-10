import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RelatoriosPainelService,
  RelatoriosResponse,
} from '../../../services/relatorios-painel.service';

@Component({
  selector: 'app-relatorios-painel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorios-painel.component.html',
  styleUrl: './relatorios-painel.component.scss',
})
export class RelatoriosPainelComponent implements OnInit {
  dados: RelatoriosResponse | null = null;
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

  constructor(private relatoriosService: RelatoriosPainelService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = null;
    this.relatoriosService.listar(this.ano, this.mes ?? undefined).subscribe({
      next: (res) => {
        this.dados = res;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os relatórios.';
        this.carregando = false;
      },
    });
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
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

  anosDisponiveis(): number[] {
    const atual = new Date().getFullYear();
    return [atual - 2, atual - 1, atual, atual + 1];
  }

  private safeMax(valores: number[]): number {
    const filtrados = valores.filter((v) => v > 0);
    if (filtrados.length === 0) return 1;
    return Math.max(...filtrados);
  }

  maxClientesPedidos(): number {
    if (!this.dados?.clientes_mais_pedidos?.length) return 1;
    return this.safeMax(this.dados.clientes_mais_pedidos.map((c) => c.total_pedidos || 0));
  }

  maxProdutosVendidos(): number {
    if (!this.dados?.produtos_mais_vendidos?.length) return 1;
    return this.safeMax(this.dados.produtos_mais_vendidos.map((p) => p.quantidade_total || 0));
  }

  maxMesesProdutivos(): number {
    if (!this.dados?.meses_mais_produtivos?.length) return 1;
    return this.safeMax(this.dados.meses_mais_produtivos.map((m) => m.valor_total || 0));
  }

  maxFaturamentoPorMes(): number {
    if (!this.dados?.faturamento_por_mes?.length) return 1;
    return this.safeMax(this.dados.faturamento_por_mes.map((m) => m.valor_total || 0));
  }

  maxRotasPedidos(): number {
    if (!this.dados?.rotas_mais_pedidos?.length) return 1;
    return this.safeMax(this.dados.rotas_mais_pedidos.map((r) => r.total_pedidos || 0));
  }

  maxVendedoresVendas(): number {
    if (!this.dados?.vendedores_mais_vendas?.length) return 1;
    return this.safeMax(this.dados.vendedores_mais_vendas.map((v) => v.valor_total || 0));
  }

  maxPedidosPorStatus(): number {
    if (!this.dados?.pedidos_por_status?.length) return 1;
    return this.safeMax(this.dados.pedidos_por_status.map((s) => s.total || 0));
  }

  maxFaturamentoPorCliente(): number {
    if (!this.dados?.faturamento_por_cliente?.length) return 1;
    return this.safeMax(this.dados.faturamento_por_cliente.map((c) => c.valor_total || 0));
  }
}
