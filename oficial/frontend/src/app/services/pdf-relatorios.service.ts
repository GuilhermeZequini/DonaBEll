import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  RelatoriosResponse,
  ClienteMaisPedido,
  ProdutoMaisVendido,
  MesProdutivo,
  ProdutoPorMes,
  RotaMaisPedidos,
  VendedorMaisVendas,
  PedidoPorStatus,
} from './relatorios-painel.service';

export type SecaoRelatorio =
  | 'clientes_mais_pedidos'
  | 'produtos_mais_vendidos'
  | 'meses_mais_produtivos'
  | 'faturamento_por_mes'
  | 'produtos_por_mes'
  | 'rotas_mais_pedidos'
  | 'vendedores_mais_vendas'
  | 'pedidos_por_status'
  | 'faturamento_por_cliente';

export const SECOES_RELATORIO_META: { key: SecaoRelatorio; titulo: string }[] = [
  { key: 'clientes_mais_pedidos', titulo: 'Clientes que mais pediram' },
  { key: 'produtos_mais_vendidos', titulo: 'Produtos mais vendidos' },
  { key: 'meses_mais_produtivos', titulo: 'Meses mais produtivos' },
  { key: 'faturamento_por_mes', titulo: 'Faturamento por mês' },
  { key: 'produtos_por_mes', titulo: 'Produtos vendidos por mês' },
  { key: 'rotas_mais_pedidos', titulo: 'Rotas com mais pedidos' },
  { key: 'vendedores_mais_vendas', titulo: 'Vendedores com mais vendas' },
  { key: 'pedidos_por_status', titulo: 'Pedidos por status' },
  { key: 'faturamento_por_cliente', titulo: 'Faturamento por cliente' },
];

export function secoesRelatorioPadraoTodas(): Record<SecaoRelatorio, boolean> {
  return {
    clientes_mais_pedidos: true,
    produtos_mais_vendidos: true,
    meses_mais_produtivos: true,
    faturamento_por_mes: true,
    produtos_por_mes: true,
    rotas_mais_pedidos: true,
    vendedores_mais_vendas: true,
    pedidos_por_status: true,
    faturamento_por_cliente: true,
  };
}

const MARGIN = 14;
const PAGE_H = 297;

function brl(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function statusLabelPt(s: string): string {
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

function linhaPeriodo(dados: RelatoriosResponse): string {
  if (dados.mes == null) {
    return `Período: ano ${dados.ano} (todos os meses)`;
  }
  const mesNome = new Date(2000, dados.mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
  return `Período: ${mesNome} de ${dados.ano}`;
}

function nextStartY(doc: jsPDF, gap = 10): number {
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
  let y = (finalY ?? MARGIN + 20) + gap;
  if (y > PAGE_H - MARGIN - 30) {
    doc.addPage();
    y = MARGIN + 6;
  }
  return y;
}

@Injectable({ providedIn: 'root' })
export class PdfRelatoriosService {
  exportar(dados: RelatoriosResponse, secoes: Record<SecaoRelatorio, boolean>): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Dona BEll - Relatorios', MARGIN, MARGIN);
    doc.setFontSize(10);
    doc.text(linhaPeriodo(dados), MARGIN, MARGIN + 8);
    doc.text(
      `Emitido em: ${new Date().toLocaleString('pt-BR')}`,
      MARGIN,
      MARGIN + 14
    );
    (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable = {
      finalY: MARGIN + 14,
    };

    const run = (fn: () => void) => fn();

    if (secoes.clientes_mais_pedidos) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'clientes_mais_pedidos')!.titulo, MARGIN, startY);
        const rows = dados.clientes_mais_pedidos.map((c: ClienteMaisPedido) => [
          c.cliente_nome,
          String(c.total_pedidos),
          brl(c.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Cliente', 'Pedidos', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.produtos_mais_vendidos) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'produtos_mais_vendidos')!.titulo, MARGIN, startY);
        const rows = dados.produtos_mais_vendidos.map((p: ProdutoMaisVendido) => [
          p.produto_nome,
          String(p.quantidade_total),
          brl(p.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Produto', 'Qtd', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.meses_mais_produtivos) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'meses_mais_produtivos')!.titulo, MARGIN, startY);
        const rows = dados.meses_mais_produtivos.map((m: MesProdutivo) => [
          m.mes_nome,
          String(m.total_pedidos),
          brl(m.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Mês', 'Pedidos', 'Faturamento']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.faturamento_por_mes) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'faturamento_por_mes')!.titulo, MARGIN, startY);
        const rows = dados.faturamento_por_mes.map((m: MesProdutivo) => [
          m.mes_nome,
          String(m.total_pedidos),
          brl(m.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Mês', 'Pedidos', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.produtos_por_mes) {
      run(() => {
        let startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'produtos_por_mes')!.titulo, MARGIN, startY);
        startY += 4;
        if (!dados.produtos_por_mes.length) {
          autoTable(doc, {
            startY,
            head: [['Mês', 'Produto', 'Qtd']],
            body: [['—', '—', '—']],
            margin: { left: MARGIN, right: MARGIN },
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 38, 38] },
          });
        } else {
          for (const bloco of dados.produtos_por_mes as ProdutoPorMes[]) {
            startY = nextStartY(doc, 8);
            doc.setFontSize(9);
            doc.text(bloco.mes_nome, MARGIN, startY);
            const rows = bloco.produtos.map((p) => [p.produto_nome, String(p.quantidade)]);
            autoTable(doc, {
              startY: startY + 2,
              head: [['Produto', 'Quantidade']],
              body: rows.length ? rows : [['—', '—']],
              margin: { left: MARGIN, right: MARGIN },
              styles: { fontSize: 8 },
              headStyles: { fillColor: [220, 38, 38] },
            });
          }
        }
      });
    }

    if (secoes.rotas_mais_pedidos) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'rotas_mais_pedidos')!.titulo, MARGIN, startY);
        const rows = dados.rotas_mais_pedidos.map((r: RotaMaisPedidos) => [
          r.rota_nome,
          String(r.total_pedidos),
          brl(r.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Rota', 'Pedidos', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.vendedores_mais_vendas) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'vendedores_mais_vendas')!.titulo, MARGIN, startY);
        const rows = dados.vendedores_mais_vendas.map((v: VendedorMaisVendas) => [
          v.usuario_nome,
          String(v.total_pedidos),
          brl(v.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Vendedor', 'Pedidos', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.pedidos_por_status) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'pedidos_por_status')!.titulo, MARGIN, startY);
        const rows = dados.pedidos_por_status.map((s: PedidoPorStatus) => [
          statusLabelPt(s.status),
          String(s.total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Status', 'Total']],
          body: rows.length ? rows : [['—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    if (secoes.faturamento_por_cliente) {
      run(() => {
        const startY = nextStartY(doc, 12);
        doc.setFontSize(11);
        doc.text(SECOES_RELATORIO_META.find((m) => m.key === 'faturamento_por_cliente')!.titulo, MARGIN, startY);
        const rows = dados.faturamento_por_cliente.map((c: ClienteMaisPedido) => [
          c.cliente_nome,
          String(c.total_pedidos),
          brl(c.valor_total),
        ]);
        autoTable(doc, {
          startY: startY + 2,
          head: [['Cliente', 'Pedidos', 'Valor']],
          body: rows.length ? rows : [['—', '—', '—']],
          margin: { left: MARGIN, right: MARGIN },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [220, 38, 38] },
        });
      });
    }

    const mesPart = dados.mes == null ? 'todos' : String(dados.mes);
    doc.save(`relatorios-donabell-${dados.ano}-${mesPart}.pdf`);
  }
}
