import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';

const API = API_URL;

export interface PedidoDashboardResumo {
  id: number;
  cliente_nome: string | null;
  status: string;
  valor_total: number;
  data_cadastro: string | null;
  itens: { produto_nome: string | null; quantidade: number }[];
}

export interface SemanaDashboard {
  semana_inicio: string;
  semana_fim: string;
  label: string;
  pedidos: PedidoDashboardResumo[];
}

export interface RotaDashboard {
  rota: { id: number | null; nome: string; ordem_prioridade: number };
  semanas: SemanaDashboard[];
}

export interface DashboardResponse {
  ano: number;
  mes: number | null;
  por_rota: RotaDashboard[];
}

@Injectable({ providedIn: 'root' })
export class DashboardPainelService {
  constructor(private http: HttpClient) {}

  listar(ano?: number, mes?: number): Observable<DashboardResponse> {
    let url = `${API}/dashboard`;
    const params: string[] = [];
    if (ano != null) params.push(`ano=${ano}`);
    if (mes != null) params.push(`mes=${mes}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<DashboardResponse>(url);
  }
}
