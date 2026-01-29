import { Component, OnInit } from '@angular/core';
import { Usuario, PaginacaoResponse } from '../../services/types/types';
import { UsuarioService } from '../../services/usuario.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pessoas-listagem',
  imports: [RouterLink, CommonModule, FormsModule], // Adicione FormsModule
  templateUrl: './pessoas-listagem.component.html',
  styleUrl: './pessoas-listagem.component.scss',
})
export class PessoasListagemComponent implements OnInit {
  ListarUsuarios: Usuario[] = [];
  loading: boolean = true;
  error: string = '';

  // Variáveis de paginação
  paginaAtual: number = 1;
  totalPaginas: number = 0;
  totalUsuarios: number = 0;
  itensPorPagina: number = 10;
  paginas: number[] = [];

  constructor(
    private service: UsuarioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(pagina: number = 1): void {
    this.loading = true;
    this.error = '';

    this.service.listar(pagina).subscribe({
      next: (response: PaginacaoResponse) => {
        this.ListarUsuarios = response.data;
        this.totalUsuarios = response.infos.total_users;

        // Se o backend retornar current_page e total de páginas
        if (response.infos.current_page) {
          this.paginaAtual = response.infos.current_page;
        }

        if (response.infos.total_pages) {
          this.totalPaginas = response.infos.total_pages;
        } else {
          // Calcular total de páginas localmente
          this.totalPaginas = this.service.calcularTotalPaginas(this.totalUsuarios);
        }

        this.gerarArrayPaginas();
        this.loading = false;
        console.log('Resposta paginada:', response);
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
        console.error('Erro:', err);
      }
    });
  }

  // Gera array de páginas para exibição
  gerarArrayPaginas(): void {
    this.paginas = [];
    const maxPaginasVisiveis = 5; // Quantidade máxima de números de página visíveis

    let inicio = Math.max(1, this.paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);

    // Ajusta início se o fim estiver no limite
    inicio = Math.max(1, fim - maxPaginasVisiveis + 1);

    for (let i = inicio; i <= fim; i++) {
      this.paginas.push(i);
    }
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaAtual) {
      this.paginaAtual = pagina;
      this.carregarUsuarios(pagina);

      // Scroll para o topo da tabela (opcional)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  excluir(id: number | undefined) {
    if (id) {
      // Implementar lógica de exclusão
      console.log('Excluir usuário:', id);
      // Após excluir, recarregar a página atual
      this.carregarUsuarios(this.paginaAtual);
    }
  }

  // Método para selecionar quantidade de itens por página (se necessário)
  mudarItensPorPagina(): void {
    // Aqui você precisaria atualizar o backend para aceitar itens por página
    // Por enquanto, apenas recalcula as páginas
    this.totalPaginas = this.service.calcularTotalPaginas(this.totalUsuarios);
    this.gerarArrayPaginas();
    this.carregarUsuarios(1); // Volta para a primeira página
  }
}
