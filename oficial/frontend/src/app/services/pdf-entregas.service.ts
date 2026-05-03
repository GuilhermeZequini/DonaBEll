import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  SemanaEntrega,
  ColunaEntrega,
  PedidoEntregaResumo,
} from './entregas-painel.service';

export type PdfEntregasModo = 'roteiro_entregador' | 'notas_pedido';

export interface PdfEntregasOpcoes {
  semanasInicio: Set<string> | 'todas';
  modoRotas: 'todas' | 'uma' | 'varias';
  rotaIds: number[];
  /** Roteiro: observações livres (paradas, restaurante, etc.). Notas: texto opcional no rodapé de cada página. */
  modoPdf: PdfEntregasModo;
  observacaoRoteiro?: string;
  observacaoRodapeNotas?: string;
}

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;

function brl(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function linhaPeriodoEntregas(ano: number, mes: number | null): string {
  if (mes == null) {
    return `Período: ano ${ano} (todos os meses)`;
  }
  const mesNome = new Date(2000, mes - 1, 1).toLocaleString('pt-BR', { month: 'long' });
  return `Período: ${mesNome} de ${ano}`;
}

function filtrarSemanas(semanas: SemanaEntrega[], opcoes: PdfEntregasOpcoes): SemanaEntrega[] {
  const filtro = opcoes.semanasInicio;
  if (filtro === 'todas') return semanas;
  return semanas.filter((s) => filtro.has(s.semana_inicio));
}

function filtrarColunas(colunas: ColunaEntrega[], opcoes: PdfEntregasOpcoes): ColunaEntrega[] {
  if (opcoes.modoRotas === 'todas') return colunas;
  const ids = new Set(opcoes.rotaIds.filter((id) => Number.isFinite(id)));
  return colunas.filter((c) => c.rota?.id != null && ids.has(c.rota.id));
}

type DocY = jsPDF & { lastAutoTable?: { finalY: number } };

function setFinalY(doc: jsPDF, y: number): void {
  (doc as DocY).lastAutoTable = { finalY: y };
}

function nextStartY(doc: jsPDF, gap = 10): number {
  const finalY = (doc as DocY).lastAutoTable?.finalY;
  let y = (finalY ?? MARGIN + 24) + gap;
  if (y > PAGE_H - MARGIN - 40) {
    doc.addPage();
    y = MARGIN + 6;
  }
  return y;
}

function wrapDraw(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

@Injectable({ providedIn: 'root' })
export class PdfEntregasService {
  exportar(
    porSemana: SemanaEntrega[],
    ano: number,
    mes: number | null,
    opcoes: PdfEntregasOpcoes
  ): void {
    if (opcoes.modoPdf === 'notas_pedido') {
      this.exportarNotasPedido(porSemana, ano, mes, opcoes);
    } else {
      this.exportarRoteiroEntregador(porSemana, ano, mes, opcoes);
    }
  }

  private exportarRoteiroEntregador(
    porSemana: SemanaEntrega[],
    ano: number,
    mes: number | null,
    opcoes: PdfEntregasOpcoes
  ): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Dona BEll - Roteiro de entregas', MARGIN, MARGIN);
    doc.setFontSize(10);
    doc.text(linhaPeriodoEntregas(ano, mes), MARGIN, MARGIN + 8);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, MARGIN, MARGIN + 14);
    setFinalY(doc, MARGIN + 14);

    const obs = (opcoes.observacaoRoteiro ?? '').trim();
    if (obs) {
      let y = nextStartY(doc, 10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Instruções / observações para o entregador', MARGIN, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      y += 5;
      y = wrapDraw(doc, obs, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
      setFinalY(doc, y + 2);
    }

    const semanas = filtrarSemanas(porSemana, opcoes);
    if (!semanas.length) {
      const y = nextStartY(doc, 12);
      doc.setFontSize(10);
      doc.text('Nenhuma semana selecionada ou sem dados.', MARGIN, y);
    } else {
      for (const semana of semanas) {
        const colunas = filtrarColunas(semana.por_rota ?? [], opcoes);
        for (const col of colunas) {
          let y = nextStartY(doc, 12);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${semana.label} — Rota: ${col.rota?.nome ?? '—'}`, MARGIN, y);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          y += 6;
          setFinalY(doc, y);

          const pedidos = col.pedidos ?? [];
          for (let idx = 0; idx < pedidos.length; idx++) {
            const ped = pedidos[idx];
            const ordem = ped.ordem_entrega != null ? String(ped.ordem_entrega) : String(idx + 1);
            y = nextStartY(doc, 8);
            if (y > PAGE_H - 70) {
              doc.addPage();
              y = MARGIN + 6;
              setFinalY(doc, y - 4);
            }
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`Parada ${ordem} — Pedido #${ped.id}`, MARGIN, y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            y += 5;
            y = wrapDraw(
              doc,
              `Cliente: ${ped.cliente_nome ?? '—'}`,
              MARGIN,
              y,
              PAGE_W - 2 * MARGIN,
              4.2
            );
            if (ped.cliente_endereco) {
              y = wrapDraw(doc, `Endereço: ${ped.cliente_endereco}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
            }
            if (ped.cliente_telefone) {
              y = wrapDraw(doc, `Telefone: ${ped.cliente_telefone}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
            }
            if (ped.cliente_documento) {
              y = wrapDraw(doc, `CPF/CNPJ: ${ped.cliente_documento}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
            }
            if (ped.data_cadastro) {
              y = wrapDraw(doc, `Pedido em: ${ped.data_cadastro}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
            }
            y = wrapDraw(doc, `Total do pedido: ${brl(ped.valor_total)}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
            if (ped.observacao) {
              doc.setFont('helvetica', 'italic');
              y = wrapDraw(doc, `Obs. do pedido: ${ped.observacao}`, MARGIN, y, PAGE_W - 2 * MARGIN, 4.2);
              doc.setFont('helvetica', 'normal');
            }
            y += 2;
            setFinalY(doc, y);

            const itens = ped.itens ?? [];
            const body: (string | number)[][] = itens.length
              ? itens.map((i) => {
                  const pu = i.preco_unitario ?? 0;
                  const sub = pu * (i.quantidade || 0);
                  return [
                    i.produto_nome ?? '—',
                    String(i.quantidade),
                    brl(pu),
                    brl(sub),
                  ];
                })
              : [['—', '0', '—', '—']];
            autoTable(doc, {
              startY: nextStartY(doc, 2),
              head: [['Produto', 'Qtd', 'Preço unit.', 'Subtotal']],
              body,
              margin: { left: MARGIN, right: MARGIN },
              styles: { fontSize: 8, cellPadding: 1.5 },
              headStyles: { fillColor: [14, 116, 144] },
            });
          }
        }
      }
    }

    const mesPart = mes == null ? 'todos' : String(mes);
    doc.save(`roteiro-entregas-donabell-${ano}-${mesPart}.pdf`);
  }

  private exportarNotasPedido(
    porSemana: SemanaEntrega[],
    ano: number,
    mes: number | null,
    opcoes: PdfEntregasOpcoes
  ): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const rodapeExtra = (opcoes.observacaoRodapeNotas ?? '').trim();

    const semanas = filtrarSemanas(porSemana, opcoes);
    const pedidosFlat: { semanaLabel: string; rotaNome: string; ped: PedidoEntregaResumo }[] = [];
    for (const semana of semanas) {
      const colunas = filtrarColunas(semana.por_rota ?? [], opcoes);
      for (const col of colunas) {
        for (const ped of col.pedidos ?? []) {
          pedidosFlat.push({
            semanaLabel: semana.label,
            rotaNome: col.rota?.nome ?? '—',
            ped,
          });
        }
      }
    }

    if (!pedidosFlat.length) {
      doc.setFontSize(14);
      doc.text('Dona BEll - Documento auxiliar de pedidos', MARGIN, MARGIN);
      doc.setFontSize(10);
      doc.text('Nenhum pedido no filtro selecionado.', MARGIN, MARGIN + 10);
      const mesPart = mes == null ? 'todos' : String(mes);
      doc.save(`notas-pedidos-donabell-${ano}-${mesPart}.pdf`);
      return;
    }

    for (let i = 0; i < pedidosFlat.length; i++) {
      if (i > 0) doc.addPage();
      const { semanaLabel, rotaNome, ped } = pedidosFlat[i];
      let y = MARGIN;

      doc.setDrawColor(40);
      doc.rect(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN);

      y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('DOCUMENTO AUXILIAR DE PEDIDO', MARGIN + 4, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      y += 4;
      doc.text('Não é Nota Fiscal eletrônica (NF-e). Uso interno / conferência de entrega.', MARGIN + 4, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Pedido nº ${ped.id}`, MARGIN + 4, y);
      y += 5;
      doc.text(`Data: ${ped.data_cadastro ?? '—'}`, MARGIN + 4, y);
      y += 5;
      doc.text(`Semana de referência: ${semanaLabel}`, MARGIN + 4, y);
      y += 5;
      doc.text(`Rota: ${rotaNome}`, MARGIN + 4, y);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Cliente / entrega', MARGIN + 4, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      y = wrapDraw(doc, ped.cliente_nome ?? '—', MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      if (ped.cliente_documento) {
        y = wrapDraw(doc, `CPF/CNPJ: ${ped.cliente_documento}`, MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      }
      if (ped.cliente_endereco) {
        y = wrapDraw(doc, `Endereço: ${ped.cliente_endereco}`, MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      }
      if (ped.cliente_telefone) {
        y = wrapDraw(doc, `Telefone: ${ped.cliente_telefone}`, MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      }
      y += 4;

      const itens = ped.itens ?? [];
      const body: (string | number)[][] = itens.length
        ? itens.map((item) => {
            const pu = item.preco_unitario ?? 0;
            const sub = pu * (item.quantidade || 0);
            return [
              item.produto_nome ?? '—',
              String(item.quantidade),
              brl(pu),
              brl(sub),
            ];
          })
        : [['—', '0', '—', '—']];

      autoTable(doc, {
        startY: y,
        head: [['Descrição', 'Qtd', 'Vl. unit.', 'Total']],
        body,
        margin: { left: MARGIN + 4, right: MARGIN + 4 },
        styles: { fontSize: 9 },
        headStyles: { fillColor: [60, 60, 60] },
      });

      y = (doc as DocY).lastAutoTable?.finalY ?? y + 30;
      y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL DO PEDIDO: ${brl(ped.valor_total)}`, MARGIN + 4, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
      doc.setFontSize(9);
      if (ped.observacao) {
        y = wrapDraw(doc, `Observações do pedido: ${ped.observacao}`, MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      }
      if (rodapeExtra) {
        y += 3;
        y = wrapDraw(doc, rodapeExtra, MARGIN + 4, y, PAGE_W - 2 * MARGIN - 8, 4);
      }
    }

    const mesPart = mes == null ? 'todos' : String(mes);
    doc.save(`notas-pedidos-donabell-${ano}-${mesPart}.pdf`);
  }
}
