import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API = 'http://127.0.0.1:8000/api';

export interface ClienteMaisPedido {
  cliente_id: number;
  cliente_nome: string;
  total_pedidos: number;
  valor_total: number;
}

export interface ProdutoMaisVendido {
  produto_id: number;
  produto_nome: string;
  quantidade_total: number;
  valor_total: number;
}

export interface MesProdutivo {
  mes: number;
  mes_nome: string;
  total_pedidos: number;
  valor_total: number;
}

export interface ProdutoPorMes {
  mes: number;
  mes_nome: string;
  produtos: { produto_id: number; produto_nome: string; quantidade: number }[];
}

export interface RotaMaisPedidos {
  rota_id: number | null;
  rota_nome: string;
  total_pedidos: number;
  valor_total: number;
}

export interface VendedorMaisVendas {
  usuario_id: number;
  usuario_nome: string;
  total_pedidos: number;
  valor_total: number;
}

export interface PedidoPorStatus {
  status: string;
  total: number;
}

export interface RelatoriosResponse {
  ano: number;
  mes: number | null;
  clientes_mais_pedidos: ClienteMaisPedido[];
  produtos_mais_vendidos: ProdutoMaisVendido[];
  meses_mais_produtivos: MesProdutivo[];
  produtos_por_mes: ProdutoPorMes[];
  faturamento_por_mes: MesProdutivo[];
  rotas_mais_pedidos: RotaMaisPedidos[];
  vendedores_mais_vendas: VendedorMaisVendas[];
  pedidos_por_status: PedidoPorStatus[];
  faturamento_por_cliente: ClienteMaisPedido[];
}

@Injectable({ providedIn: 'root' })
export class RelatoriosPainelService {
  constructor(private http: HttpClient) {}

  listar(ano?: number, mes?: number): Observable<RelatoriosResponse> {
    let url = `${API}/relatorios`;
    const params: string[] = [];
    if (ano != null) params.push(`ano=${ano}`);
    if (mes != null) params.push(`mes=${mes}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<RelatoriosResponse>(url);
  }
}
