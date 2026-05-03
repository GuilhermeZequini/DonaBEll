import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EntregasPainelService,
  ColunaEntrega,
  PedidoEntregaResumo,
  SemanaEntrega,
} from '../../../../services/entregas-painel.service';
import {
  PdfEntregasService,
  PdfEntregasOpcoes,
  PdfEntregasModo,
} from '../../../../services/pdf-entregas.service';

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
  /** Checkboxes por semana_inicio */
  pdfSemanas: Record<string, boolean> = {};
  pdfModoRotas: PdfEntregasOpcoes['modoRotas'] = 'todas';
  pdfRotaUnicaId: number | null = null;
  pdfRotasVarias: Record<number, boolean> = {};
  /** Observações impressas no roteiro (paradas, restaurante, etc.) */
  pdfObsRoteiro = '';
  /** Texto opcional no rodapé de cada página do PDF “notas” */
  pdfObsRodapeNotas = '';
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
    private service: EntregasPainelService,
    private pdfEntregas: PdfEntregasService
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = null;
    this.service.listarPorSemana(this.ano, this.mes).subscribe({
      next: (res) => {
        this.porSemana = res.por_semana ?? [];
        this.resetPdfSelecoes();
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

  rotasUnicasPdf(): { id: number; nome: string }[] {
    const map = new Map<number, string>();
    for (const s of this.porSemana) {
      for (const col of s.por_rota ?? []) {
        if (col.rota?.id != null) {
          map.set(col.rota.id, col.rota.nome ?? `Rota ${col.rota.id}`);
        }
      }
    }
    return [...map.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  private resetPdfSelecoes(): void {
    this.pdfSemanas = {};
    for (const s of this.porSemana) {
      this.pdfSemanas[s.semana_inicio] = true;
    }
    this.pdfModoRotas = 'todas';
    const rotas = this.rotasUnicasPdf();
    this.pdfRotaUnicaId = rotas.length ? rotas[0].id : null;
    this.pdfRotasVarias = {};
    for (const r of rotas) {
      this.pdfRotasVarias[r.id] = true;
    }
    this.pdfObsRoteiro = '';
    this.pdfObsRodapeNotas = '';
  }

  private montarOpcoesPdf(modo: PdfEntregasModo): PdfEntregasOpcoes | null {
    if (!this.porSemana.length) {
      alert('Não há dados para exportar.');
      return null;
    }
    const selectedKeys = this.porSemana
      .filter((s) => this.pdfSemanas[s.semana_inicio])
      .map((s) => s.semana_inicio);
    if (!selectedKeys.length) {
      alert('Selecione ao menos uma semana.');
      return null;
    }
    const semanasInicio: PdfEntregasOpcoes['semanasInicio'] =
      selectedKeys.length === this.porSemana.length ? 'todas' : new Set(selectedKeys);

    let rotaIds: number[] = [];
    if (this.pdfModoRotas === 'uma') {
      if (this.pdfRotaUnicaId == null) {
        alert('Selecione uma rota.');
        return null;
      }
      rotaIds = [this.pdfRotaUnicaId];
    } else if (this.pdfModoRotas === 'varias') {
      rotaIds = Object.entries(this.pdfRotasVarias)
        .filter(([, v]) => v)
        .map(([id]) => Number(id));
      if (!rotaIds.length) {
        alert('Selecione ao menos uma rota.');
        return null;
      }
    }

    return {
      semanasInicio,
      modoRotas: this.pdfModoRotas,
      rotaIds,
      modoPdf: modo,
      observacaoRoteiro: this.pdfObsRoteiro,
      observacaoRodapeNotas: this.pdfObsRodapeNotas,
    };
  }

  exportarPdfRoteiro(): void {
    const op = this.montarOpcoesPdf('roteiro_entregador');
    if (!op) return;
    this.pdfEntregas.exportar(this.porSemana, this.ano, this.mes, op);
  }

  exportarPdfNotas(): void {
    const op = this.montarOpcoesPdf('notas_pedido');
    if (!op) return;
    this.pdfEntregas.exportar(this.porSemana, this.ano, this.mes, op);
  }
}
