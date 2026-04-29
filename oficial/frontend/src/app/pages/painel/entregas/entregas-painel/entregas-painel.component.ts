import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EntregasPainelService,
  ColunaEntrega,
  PedidoEntregaResumo,
  SemanaEntrega,
} from '../../../../services/entregas-painel.service';

@Component({
  selector: 'app-entregas-painel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entregas-painel.component.html',
  styleUrl: './entregas-painel.component.scss',
})
export class EntregasPainelComponent implements OnInit {
  porSemana: SemanaEntrega[] = [];
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

  constructor(private service: EntregasPainelService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = null;
    this.service.listarPorSemana(this.ano, this.mes).subscribe({
      next: (res) => {
        this.porSemana = res.por_semana ?? [];
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as entregas.';
        this.carregando = false;
      },
    });
  }

  anosDisponiveis(): number[] {
    const atual = new Date().getFullYear();
    return [atual - 1, atual, atual + 1];
  }

  marcarEntregue(pedidoId: number): void {
    this.service.marcarEntregue(pedidoId).subscribe({
      next: () => this.carregar(),
      error: (err) =>
        alert(err.error?.message || 'Não foi possível marcar como entregue.'),
    });
  }

  moverParaCima(col: ColunaEntrega, index: number): void {
    if (index <= 0 || !col.rota?.id) return;
    const pedidos = [...col.pedidos];
    [pedidos[index - 1], pedidos[index]] = [pedidos[index], pedidos[index - 1]];
    this.reordenarColuna(col, pedidos);
  }

  moverParaBaixo(col: ColunaEntrega, index: number): void {
    if (index >= col.pedidos.length - 1 || !col.rota?.id) return;
    const pedidos = [...col.pedidos];
    [pedidos[index], pedidos[index + 1]] = [pedidos[index + 1], pedidos[index]];
    this.reordenarColuna(col, pedidos);
  }

  private reordenarColuna(col: ColunaEntrega, pedidos: PedidoEntregaResumo[]): void {
    const ids = pedidos.map((p) => p.id);
    this.service.reordenar(col.rota.id, ids).subscribe({
      next: () => this.carregar(),
      error: () => alert('Não foi possível reordenar.'),
    });
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

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
