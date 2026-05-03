import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';

const API_AUTH = API_URL;

export interface LoginResponse {
  message: string;
  token: string;
  usuario: {
    id: number;
    nome: string;
    tipo_perfil: string;
  };
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  tipo_perfil: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = API_AUTH;

  constructor(private http: HttpClient) {}

  /**
   * Login: aceita email (ou "admin") e senha.
   * Backend aceita admin/admin e usuários da tabela usuario (email + senha).
   */
  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, senha })
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this.setUsuario(res.usuario);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsuario(): UsuarioLogado | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioLogado;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private setUsuario(usuario: UsuarioLogado): void {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  }
}
