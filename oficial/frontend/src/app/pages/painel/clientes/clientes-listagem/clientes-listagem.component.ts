import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientesPainelService, ClientePainel, ClienteCreate, RotaOption } from '../../../../services/clientes-painel.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';

@Component({
  selector: 'app-clientes-listagem',
  standalone: true,
  imports: [RouterLink, FormsModule, ModalComponent],
  templateUrl: './clientes-listagem.component.html',
  styleUrl: './clientes-listagem.component.scss',
})
export class ClientesListagemComponent implements OnInit {
  clientes: ClientePainel[] = [];
  rotas: RotaOption[] = [];
  carregando = true;
  erro: string | null = null;
  filtroTipo = '';
  filtroRotaId: number | null = null;
  paginaAtual = 1;
  ultimaPagina = 1;
  total = 0;

  modalAberto = false;
  modalEdicao: ClientePainel | null = null;
  enviando = false;
  formErro: string | null = null;

  form: ClienteCreate & { ativo?: boolean } = this.formVazio();

  constructor(private service: ClientesPainelService) {}

  ngOnInit(): void {
    this.carregarRotas();
    this.carregar();
  }

  formVazio(): ClienteCreate & { ativo?: boolean } {
    return {
      nome: '',
      tipo_cliente: 'PF',
      CNPJ_CPF: '',
      email: '',
      telefone: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      complemento: '',
      Rota_id: null,
      ativo: true,
    };
  }

  carregar(pagina?: number): void {
    if (pagina != null) this.paginaAtual = pagina;
    this.carregando = true;
    this.erro = null;
    const tipo = this.filtroTipo === 'PF' || this.filtroTipo === 'PJ' ? this.filtroTipo : undefined;
    this.service.listar(tipo, this.filtroRotaId ?? undefined, this.paginaAtual).subscribe({
      next: (res) => {
        this.clientes = res.data;
        this.paginaAtual = res.current_page;
        this.ultimaPagina = res.last_page;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os clientes.';
        this.carregando = false;
      },
    });
  }

  carregarRotas(): void {
    this.service.listarRotas().subscribe({
      next: (r) => (this.rotas = r),
      error: () => (this.rotas = []),
    });
  }

  abrirNovo(): void {
    this.modalEdicao = null;
    this.form = this.formVazio();
    this.formErro = null;
    this.modalAberto = true;
  }

  abrirEditar(c: ClientePainel): void {
    this.modalEdicao = c;
    this.form = {
      nome: c.nome,
      tipo_cliente: c.tipo_cliente,
      CNPJ_CPF: c.CNPJ_CPF,
      email: c.email ?? '',
      telefone: c.telefone ?? '',
      rua: c.rua ?? '',
      numero: c.numero ?? '',
      bairro: c.bairro ?? '',
      cidade: c.cidade ?? '',
      complemento: c.complemento ?? '',
      Rota_id: c.Rota_id,
      ativo: c.ativo,
    };
    this.formErro = null;
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (!this.enviando) this.modalAberto = false;
  }

  get modalTitulo(): string {
    return this.modalEdicao ? 'Editar Cliente' : 'Novo Cliente';
  }

  salvar(): void {
    this.formErro = null;
    if (!this.form.nome?.trim()) {
      this.formErro = 'Preencha o nome.';
      return;
    }
    if (!this.form.CNPJ_CPF?.trim()) {
      this.formErro = 'Preencha o CPF/CNPJ.';
      return;
    }
    if (this.form.tipo_cliente === 'PJ' && !this.form.Rota_id) {
      this.formErro = 'Pessoa Jurídica deve ter uma rota de entrega.';
      return;
    }

    this.enviando = true;
    const payload: ClienteCreate = {
      nome: this.form.nome.trim(),
      tipo_cliente: this.form.tipo_cliente,
      CNPJ_CPF: this.form.CNPJ_CPF.trim(),
      email: this.form.email?.trim() || undefined,
      telefone: this.form.telefone?.trim() || undefined,
      rua: this.form.rua?.trim() || undefined,
      numero: this.form.numero?.trim() || undefined,
      bairro: this.form.bairro?.trim() || undefined,
      cidade: this.form.cidade?.trim() || undefined,
      complemento: this.form.complemento?.trim() || undefined,
      Rota_id: this.form.Rota_id ?? undefined,
    };

    if (this.modalEdicao) {
      this.service.atualizar(this.modalEdicao.id, { ...payload, ativo: this.form.ativo }).subscribe({
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
          this.formErro = err.error?.message || 'Não foi possível criar o cliente.';
          this.enviando = false;
        },
      });
    }
  }

  excluir(c: ClientePainel): void {
    if (!confirm(`Excluir o cliente "${c.nome}"?`)) return;
    this.service.excluir(c.id).subscribe({
      next: () => this.carregar(),
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Não foi possível excluir o cliente.';
        alert(msg);
      },
    });
  }

  tipoLabel(t: string): string {
    return t === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
  }
}
