import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Paginado } from '../models/paginado.model';
import { API_URL } from '../config/api.config';

const API_USUARIOS = `${API_URL}/usuarios`;

export interface UsuarioPainel {
  id: number;
  nome: string;
  email: string | null;
  tipo_perfil: string;
  ativo: number;
  data_cadastro: string;
}

export interface UsuarioCreate {
  nome: string;
  email: string;
  senha: string;
  tipo_perfil: string;
  ativo?: boolean;
}

export interface UsuarioUpdate {
  nome?: string;
  email?: string;
  senha?: string;
  tipo_perfil?: string;
  ativo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosPainelService {
  constructor(private http: HttpClient) {}

  listar(pagina = 1): Observable<Paginado<UsuarioPainel>> {
    const params = new HttpParams().set('page', String(pagina)).set('per_page', '15');
    return this.http.get<Paginado<UsuarioPainel>>(API_USUARIOS, { params });
  }

  buscar(id: number): Observable<UsuarioPainel> {
    return this.http.get<UsuarioPainel>(`${API_USUARIOS}/${id}`);
  }

  criar(dados: UsuarioCreate): Observable<UsuarioPainel> {
    return this.http.post<UsuarioPainel>(API_USUARIOS, dados);
  }

  atualizar(id: number, dados: UsuarioUpdate): Observable<UsuarioPainel> {
    return this.http.put<UsuarioPainel>(`${API_USUARIOS}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API_USUARIOS}/${id}`);
  }
}
