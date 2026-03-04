import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProdutosPainelService, ProdutoPainel, ProdutoCreate } from '../../../../services/produtos-painel.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';

@Component({
  selector: 'app-produtos-listagem',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './produtos-listagem.component.html',
  styleUrl: './produtos-listagem.component.scss',
})
export class ProdutosListagemComponent implements OnInit {
  produtos: ProdutoPainel[] = [];
  carregando = true;
  erro: string | null = null;
  paginaAtual = 1;
  ultimaPagina = 1;
  total = 0;

  filtroAtivo: string = '';

  modalAberto = false;
  modalEdicao: ProdutoPainel | null = null;
  enviando = false;
  formErro: string | null = null;

  form: ProdutoCreate & { ativo?: boolean } = this.formVazio();
  /** Valores exibidos nos inputs de preço (formato 50,00). Ao focar em 0,00 limpa; ao sair formata com ,00. */
  formPrecoPfDisplay = '';
  formPrecoPjDisplay = '';

  constructor(private service: ProdutosPainelService) {}

  formVazio(): ProdutoCreate & { ativo?: boolean } {
    return {
      nome: '',
      descricao: '',
      preco_pf: 0,
      preco_pj: 0,
      ativo: true,
    };
  }

  /** Formata número para exibir no input (50 → "50,00"). Para 0 retorna "0,00". */
  precoParaInput(n: number): string {
    const v = Number(n);
    if (isNaN(v) || v === 0) return '0,00';
    return v.toFixed(2).replace('.', ',');
  }

  /** Ao focar: se estiver "0,00", limpa o campo para o usuário digitar. */
  precoFocus(campo: 'pf' | 'pj'): void {
    if (campo === 'pf' && this.formPrecoPfDisplay === '0,00') this.formPrecoPfDisplay = '';
    if (campo === 'pj' && this.formPrecoPjDisplay === '0,00') this.formPrecoPjDisplay = '';
  }

  /** Ao sair do campo: formata com duas casas (50 → "50,00"); se vazio, "0,00". */
  precoBlur(campo: 'pf' | 'pj'): void {
    const raw = campo === 'pf' ? this.formPrecoPfDisplay : this.formPrecoPjDisplay;
    const num = this.parsePreco(raw);
    const formatado = num === 0 ? '0,00' : num.toFixed(2).replace('.', ',');
    if (campo === 'pf') this.formPrecoPfDisplay = formatado;
    else this.formPrecoPjDisplay = formatado;
  }

  /** Converte string do input (50 ou 50,5 ou 50,50) para número com 2 decimais. */
  parsePreco(s: string): number {
    if (!s || !s.trim()) return 0;
    const normalized = String(s).trim().replace(',', '.');
    const num = parseFloat(normalized);
    if (isNaN(num) || num < 0) return 0;
    return Math.round(num * 100) / 100;
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(pagina?: number): void {
    if (pagina != null) this.paginaAtual = pagina;
    this.carregando = true;
    this.erro = null;
    const ativo =
      this.filtroAtivo === '1' ? true : this.filtroAtivo === '0' ? false : undefined;
    this.service.listar(ativo, this.paginaAtual).subscribe({
      next: (res) => {
        this.produtos = res.data;
        this.paginaAtual = res.current_page;
        this.ultimaPagina = res.last_page;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os produtos.';
        this.carregando = false;
      },
    });
  }

  abrirNovo(): void {
    this.modalEdicao = null;
    this.form = this.formVazio();
    this.formPrecoPfDisplay = '';
    this.formPrecoPjDisplay = '';
    this.formErro = null;
    this.modalAberto = true;
  }

  abrirEditar(p: ProdutoPainel): void {
    this.modalEdicao = p;
    this.form = {
      nome: p.nome,
      descricao: p.descricao ?? '',
      preco_pf: p.preco_pf,
      preco_pj: p.preco_pj,
      ativo: !!p.ativo,
    };
    this.formPrecoPfDisplay = this.precoParaInput(p.preco_pf);
    this.formPrecoPjDisplay = this.precoParaInput(p.preco_pj);
    this.formErro = null;
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (!this.enviando) this.modalAberto = false;
  }

  get modalTitulo(): string {
    return this.modalEdicao ? 'Editar Produto' : 'Novo Produto';
  }

  salvar(): void {
    this.formErro = null;
    if (!this.form.nome?.trim()) {
      this.formErro = 'Preencha o nome.';
      return;
    }
    const pf = this.parsePreco(this.formPrecoPfDisplay);
    const pj = this.parsePreco(this.formPrecoPjDisplay);
    if (pf < 0 || pj < 0) {
      this.formErro = 'Preços devem ser ≥ 0.';
      return;
    }

    this.enviando = true;
    const payload: ProdutoCreate = {
      nome: this.form.nome.trim(),
      descricao: this.form.descricao?.trim() || null,
      preco_pf: pf,
      preco_pj: pj,
      ativo: this.form.ativo,
    };

    if (this.modalEdicao) {
      this.service.atualizar(this.modalEdicao.id, payload).subscribe({
        next: () => {
          this.enviando = false;
          this.modalAberto = false;
          this.carregar();
        },
        error: (err) => {
          this.formErro = err.error?.message || 'Não foi possível salvar.';
          this.enviando = false;
        },
      });
    } else {
      this.service.criar(payload).subscribe({
        next: () => {
          this.enviando = false;
          this.modalAberto = false;
          this.carregar();
        },
        error: (err) => {
          this.formErro = err.error?.message || 'Não foi possível criar o produto.';
          this.enviando = false;
        },
      });
    }
  }

  excluir(p: ProdutoPainel): void {
    if (!confirm(`Excluir o produto "${p.nome}"?`)) return;
    this.service.excluir(p.id).subscribe({
      next: () => this.carregar(),
      error: () => alert('Não foi possível excluir o produto.'),
    });
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
