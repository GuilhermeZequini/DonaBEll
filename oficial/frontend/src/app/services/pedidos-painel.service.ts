import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado } from '../models/paginado.model';

import { API_URL } from '../config/api.config';

const API = API_URL;

export interface ItemPedidoPainel {
  id?: number;
  Pedido_id?: number;
  Produto_id: number;
  produto_nome?: string;
  quantidade: number;
  preco_unitario?: number;
  observacao?: string | null;
}

export interface PedidoPainel {
  id: number;
  Usuario_id: number;
  vendedor_nome: string | null;
  Cliente_Usuario_id: number;
  cliente_nome: string | null;
  cliente_tipo: string;
  rota_id: number | null;
  rota_nome: string | null;
  data_cadastro: string | null;
  status: string;
  observacao: string | null;
  valor_total: number;
  itens: ItemPedidoPainel[];
}

export interface PedidoCreate {
  Cliente_Usuario_id: number;
  itens: { Produto_id: number; quantidade: number; observacao?: string }[];
  observacao?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PedidosPainelService {
  constructor(private http: HttpClient) {}

  listar(status?: string, clienteId?: number, pagina = 1): Observable<Paginado<PedidoPainel>> {
    let params = new HttpParams().set('page', String(pagina)).set('per_page', '15');
    if (status) params = params.set('status', status);
    if (clienteId != null) params = params.set('cliente_id', String(clienteId));
    return this.http.get<Paginado<PedidoPainel>>(`${API}/pedidos`, { params });
  }

  buscar(id: number): Observable<PedidoPainel> {
    return this.http.get<PedidoPainel>(`${API}/pedidos/${id}`);
  }

  criar(dados: PedidoCreate): Observable<PedidoPainel> {
    return this.http.post<PedidoPainel>(`${API}/pedidos`, dados);
  }

  atualizar(id: number, dados: Partial<PedidoCreate>): Observable<PedidoPainel> {
    return this.http.put<PedidoPainel>(`${API}/pedidos/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/pedidos/${id}`);
  }

  aprovar(id: number): Observable<PedidoPainel> {
    return this.http.post<PedidoPainel>(`${API}/pedidos/${id}/aprovar`, {});
  }

  rejeitar(id: number): Observable<PedidoPainel> {
    return this.http.post<PedidoPainel>(`${API}/pedidos/${id}/rejeitar`, {});
  }
}
