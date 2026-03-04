import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado } from '../models/paginado.model';

const API = 'http://127.0.0.1:8000/api';

export interface ClientePainel {
  id: number;
  Usuario_id: number | null;
  nome: string;
  email: string | null;
  tipo_cliente: string;
  CNPJ_CPF: string;
  telefone: string | null;
  numero: string | null;
  rua: string | null;
  bairro: string | null;
  cidade: string | null;
  complemento: string | null;
  Rota_id: number | null;
  rota_nome: string | null;
  ativo: boolean;
  tem_usuario: boolean;
}

export interface ClienteCreate {
  nome: string;
  tipo_cliente: string;
  CNPJ_CPF: string;
  email?: string;
  telefone?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  complemento?: string;
  Rota_id?: number | null;
  criar_usuario?: boolean;
  senha?: string;
  Usuario_id?: number | null;
}

export interface RotaOption {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesPainelService {
  constructor(private http: HttpClient) {}

  listar(tipo?: string, rotaId?: number, pagina = 1, perPage = 15): Observable<Paginado<ClientePainel>> {
    let params = new HttpParams().set('page', String(pagina)).set('per_page', String(perPage));
    if (tipo) params = params.set('tipo', tipo);
    if (rotaId != null) params = params.set('rota_id', rotaId.toString());
    return this.http.get<Paginado<ClientePainel>>(`${API}/clientes`, { params });
  }

  buscar(id: number): Observable<ClientePainel> {
    return this.http.get<ClientePainel>(`${API}/clientes/${id}`);
  }

  criar(dados: ClienteCreate): Observable<ClientePainel> {
    return this.http.post<ClientePainel>(`${API}/clientes`, dados);
  }

  atualizar(id: number, dados: Partial<ClienteCreate> & { ativo?: boolean }): Observable<ClientePainel> {
    return this.http.put<ClientePainel>(`${API}/clientes/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/clientes/${id}`);
  }

  listarRotas(): Observable<RotaOption[]> {
    return this.http.get<RotaOption[]>(`${API}/rotas`, {
      params: new HttpParams().set('ativo', '1'),
    });
  }
}
