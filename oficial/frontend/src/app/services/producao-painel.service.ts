import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';

const API = API_URL;

export interface PedidoProducaoResumo {
  id: number;
  cliente_nome: string | null;
  status: string;
  valor_total: number;
  data_cadastro: string | null;
  itens: { produto_nome: string | null; quantidade: number }[];
}

export interface ColunaRota {
  rota: { id: number | null; nome: string; ordem_prioridade: number };
  pedidos: PedidoProducaoResumo[];
}

/** Semana (domingo a sábado) com colunas por rota — só rotas com pedidos. */
export interface SemanaProducao {
  semana_inicio: string;
  semana_fim: string;
  label: string;
  por_rota: ColunaRota[];
}

export interface ProducaoPorRotaResponse {
  por_semana: SemanaProducao[];
}

export interface ConsolidacaoProduto {
  Produto_id: number;
  produto_nome: string;
  quantidade_total: number;
}

export interface ConsolidacaoRota {
  rota_id: number | null;
  rota_nome: string;
  produtos: ConsolidacaoProduto[];
}

export interface ConsolidacaoPeriodoMeta {
  tipo: string;
  label: string;
  inicio: string;
  fim: string;
}

export interface ConsolidacaoSemanaBloco {
  periodo: ConsolidacaoPeriodoMeta;
  consolidacao: ConsolidacaoRota[];
}

export interface ConsolidacaoMultiResponse {
  semanas: ConsolidacaoSemanaBloco[];
}

@Injectable({ providedIn: 'root' })
export class ProducaoPainelService {
  constructor(private http: HttpClient) {}

  listarPorRotas(): Observable<ProducaoPorRotaResponse> {
    return this.http.get<ProducaoPorRotaResponse>(`${API}/producao`);
  }

  /**
   * Consolidação por semana (atual e anteriores). nSemanas entre 1 e 26.
   */
  getConsolidacao(nSemanas: number = 1): Observable<ConsolidacaoMultiResponse> {
    const n = Math.min(Math.max(Math.floor(nSemanas) || 1, 1), 26);
    const params = new HttpParams().set('n_semanas', String(n));
    return this.http.get<ConsolidacaoMultiResponse>(`${API}/producao/consolidacao`, { params });
  }

  atualizarStatus(pedidoId: number, status: 'EM_PRODUCAO' | 'PRONTO'): Observable<{ id: number; status: string }> {
    return this.http.put<{ id: number; status: string }>(`${API}/producao/pedidos/${pedidoId}/status`, { status });
  }
}
