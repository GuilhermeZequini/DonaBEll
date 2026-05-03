import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado } from '../models/paginado.model';
import { API_URL } from '../config/api.config';

const API = API_URL;

export interface RotaPainel {
  id: number;
  nome: string;
  ordem_prioridade: number;
  descricao: string | null;
  ativo: number;
}

export interface RotaCreate {
  nome: string;
  ordem_prioridade: number;
  descricao?: string | null;
  ativo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RotasPainelService {
  constructor(private http: HttpClient) {}

  /** Lista todas as rotas (para CRUD), paginado. */
  listar(pagina = 1): Observable<Paginado<RotaPainel>> {
    const params = new HttpParams().set('page', String(pagina)).set('per_page', '15');
    return this.http.get<Paginado<RotaPainel>>(`${API}/rotas`, { params });
  }

  /** Lista apenas rotas ativas (para dropdown em clientes). */
  listarAtivas(): Observable<RotaPainel[]> {
    return this.http.get<RotaPainel[]>(`${API}/rotas`, {
      params: new HttpParams().set('ativo', '1'),
    });
  }

  buscar(id: number): Observable<RotaPainel> {
    return this.http.get<RotaPainel>(`${API}/rotas/${id}`);
  }

  criar(dados: RotaCreate): Observable<RotaPainel> {
    return this.http.post<RotaPainel>(`${API}/rotas`, dados);
  }

  atualizar(id: number, dados: Partial<RotaCreate>): Observable<RotaPainel> {
    return this.http.put<RotaPainel>(`${API}/rotas/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/rotas/${id}`);
  }
}
