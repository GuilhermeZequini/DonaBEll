import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario , PaginacaoResponse } from './types/types';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly API = 'http://127.0.0.1:8000/api/users';
  private readonly REG_PER_PAGE = 10; // Deve ser o mesmo do backend

  constructor(private http: HttpClient) { }

  listar(pagina: number = 1): Observable<PaginacaoResponse> {
    let params = new HttpParams();

    // Se seu backend espera 'current_page' como parâmetro
    params = params.set('current_page', pagina.toString());

    return this.http.get<PaginacaoResponse>(this.API, { params });
  }

  // Método para calcular o total de páginas
  calcularTotalPaginas(totalItens: number): number {
    return Math.ceil(totalItens / this.REG_PER_PAGE);
  }
}
