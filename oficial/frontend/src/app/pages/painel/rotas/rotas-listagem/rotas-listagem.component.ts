import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RotasPainelService, RotaPainel, RotaCreate } from '../../../../services/rotas-painel.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';

@Component({
  selector: 'app-rotas-listagem',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './rotas-listagem.component.html',
  styleUrl: './rotas-listagem.component.scss',
})
export class RotasListagemComponent implements OnInit {
  rotas: RotaPainel[] = [];
  carregando = true;
  erro: string | null = null;
  paginaAtual = 1;
  ultimaPagina = 1;
  total = 0;

  modalAberto = false;
  modalEdicao: RotaPainel | null = null;
  enviando = false;
  formErro: string | null = null;

  form: RotaCreate & { ativo?: boolean } = {
    nome: '',
    ordem_prioridade: 0,
    descricao: '',
    ativo: true,
  };

  constructor(private service: RotasPainelService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(pagina?: number): void {
    if (pagina != null) this.paginaAtual = pagina;
    this.carregando = true;
    this.erro = null;
    this.service.listar(this.paginaAtual).subscribe({
      next: (res) => {
        this.rotas = res.data;
        this.paginaAtual = res.current_page;
        this.ultimaPagina = res.last_page;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as rotas.';
        this.carregando = false;
      },
    });
  }

  abrirNovo(): void {
    this.modalEdicao = null;
    this.form = { nome: '', ordem_prioridade: 0, descricao: '', ativo: true };
    this.formErro = null;
    this.modalAberto = true;
  }

  abrirEditar(r: RotaPainel): void {
    this.modalEdicao = r;
    this.form = {
      nome: r.nome,
      ordem_prioridade: r.ordem_prioridade,
      descricao: r.descricao ?? '',
      ativo: !!r.ativo,
    };
    this.formErro = null;
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (!this.enviando) this.modalAberto = false;
  }

  get modalTitulo(): string {
    return this.modalEdicao ? 'Editar Rota' : 'Nova Rota';
  }

  salvar(): void {
    this.formErro = null;
    if (!this.form.nome?.trim()) {
      this.formErro = 'Preencha o nome.';
      return;
    }

    this.enviando = true;
    const payload: RotaCreate = {
      nome: this.form.nome.trim(),
      ordem_prioridade: Number(this.form.ordem_prioridade) || 0,
      descricao: this.form.descricao?.trim() || null,
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
          this.formErro = err.error?.message || 'Não foi possível criar a rota.';
          this.enviando = false;
        },
      });
    }
  }

  excluir(r: RotaPainel): void {
    if (!confirm(`Excluir a rota "${r.nome}"?`)) return;
    this.service.excluir(r.id).subscribe({
      next: () => this.carregar(),
      error: () => alert('Não foi possível excluir a rota.'),
    });
  }
}
