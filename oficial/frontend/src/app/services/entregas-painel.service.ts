import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API = 'http://127.0.0.1:8000/api';

export interface PedidoEntregaResumo {
  id: number;
  cliente_nome: string | null;
  status: string;
  valor_total: number;
  data_cadastro: string | null;
  ordem_entrega: number | null;
  rota_id: number | null;
  rota_nome: string | null;
  itens: { produto_nome: string | null; quantidade: number }[];
}

export interface ColunaEntrega {
  rota: { id: number; nome: string; ordem_prioridade: number };
  pedidos: PedidoEntregaResumo[];
}

export interface SemanaEntrega {
  semana_inicio: string;
  semana_fim: string;
  label: string;
  por_rota: ColunaEntrega[];
}

export interface EntregasPorSemanaResponse {
  ano: number;
  mes: number | null;
  por_semana: SemanaEntrega[];
}

@Injectable({ providedIn: 'root' })
export class EntregasPainelService {
  constructor(private http: HttpClient) {}

  listarPorSemana(ano?: number, mes?: number | null): Observable<EntregasPorSemanaResponse> {
    const params: Record<string, string> = {};
    if (ano != null) params['ano'] = String(ano);
    if (mes != null) params['mes'] = String(mes);
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API}/entregas?${qs}` : `${API}/entregas`;
    return this.http.get<EntregasPorSemanaResponse>(url);
  }

  marcarEntregue(pedidoId: number): Observable<{ id: number; status: string }> {
    return this.http.put<{ id: number; status: string }>(
      `${API}/entregas/${pedidoId}/entregue`,
      {}
    );
  }

  reordenar(rotaId: number, pedidoIds: number[]): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/entregas/reordenar`, {
      rota_id: rotaId,
      pedido_ids: pedidoIds,
    });
  }
}
