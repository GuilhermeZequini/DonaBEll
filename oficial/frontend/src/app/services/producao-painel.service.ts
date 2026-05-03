import { HttpClient } from '@angular/common/http';
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

export interface ProducaoPorRotaResponse {
  por_rota: ColunaRota[];
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

export interface ConsolidacaoResponse {
  consolidacao: ConsolidacaoRota[];
}

@Injectable({ providedIn: 'root' })
export class ProducaoPainelService {
  constructor(private http: HttpClient) {}

  listarPorRotas(): Observable<ProducaoPorRotaResponse> {
    return this.http.get<ProducaoPorRotaResponse>(`${API}/producao`);
  }

  getConsolidacao(): Observable<ConsolidacaoResponse> {
    return this.http.get<ConsolidacaoResponse>(`${API}/producao/consolidacao`);
  }

  atualizarStatus(pedidoId: number, status: 'EM_PRODUCAO' | 'PRONTO'): Observable<{ id: number; status: string }> {
    return this.http.put<{ id: number; status: string }>(`${API}/producao/pedidos/${pedidoId}/status`, { status });
  }
}
