import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado } from '../models/paginado.model';

import { API_URL } from '../config/api.config';

const API = API_URL;

export interface ProdutoPainel {
  id: number;
  nome: string;
  descricao: string | null;
  preco_pf: number;
  preco_pj: number;
  data_cadastro: string;
  ativo: boolean;
}

export interface ProdutoCreate {
  nome: string;
  descricao?: string | null;
  preco_pf: number;
  preco_pj: number;
  ativo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProdutosPainelService {
  constructor(private http: HttpClient) {}

  listar(ativo?: boolean, pagina = 1, perPage = 15): Observable<Paginado<ProdutoPainel>> {
    let params = new HttpParams().set('page', String(pagina)).set('per_page', String(perPage));
    if (ativo !== undefined) params = params.set('ativo', ativo ? '1' : '0');
    return this.http.get<Paginado<ProdutoPainel>>(`${API}/produtos`, { params });
  }

  buscar(id: number): Observable<ProdutoPainel> {
    return this.http.get<ProdutoPainel>(`${API}/produtos/${id}`);
  }

  criar(dados: ProdutoCreate): Observable<ProdutoPainel> {
    return this.http.post<ProdutoPainel>(`${API}/produtos`, dados);
  }

  atualizar(id: number, dados: Partial<ProdutoCreate>): Observable<ProdutoPainel> {
    return this.http.put<ProdutoPainel>(`${API}/produtos/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/produtos/${id}`);
  }
}
