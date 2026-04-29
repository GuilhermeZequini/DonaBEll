import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuariosPainelService, UsuarioPainel, UsuarioCreate, UsuarioUpdate } from '../../../../services/usuarios-painel.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';

// Clientes são cadastrados apenas na aba Clientes; na aba Usuários só outros perfis.
const PERFIS_NAO_CLIENTE = ['VENDEDOR', 'GERENTE', 'PRODUCAO', 'ENTREGADOR'];

@Component({
  selector: 'app-usuarios-listagem',
  standalone: true,
  imports: [FormsModule, ModalComponent],
  templateUrl: './usuarios-listagem.component.html',
  styleUrl: './usuarios-listagem.component.scss',
})
export class UsuariosListagemComponent implements OnInit {
  usuarios: UsuarioPainel[] = [];
  carregando = true;
  erro: string | null = null;
  paginaAtual = 1;
  ultimaPagina = 1;
  total = 0;

  modalAberto = false;
  modalEdicao: UsuarioPainel | null = null;
  enviando = false;
  formErro: string | null = null;

  form = {
    nome: '',
    email: '',
    senha: '',
    tipo_perfil: 'VENDEDOR',
    ativo: true,
  };

  /** Opções de perfil: ao criar não inclui CLIENTE; ao editar usuário CLIENTE inclui para exibir valor atual. */
  get perfilOptions(): string[] {
    if (!this.modalEdicao) return PERFIS_NAO_CLIENTE;
    return this.modalEdicao.tipo_perfil === 'CLIENTE'
      ? ['CLIENTE', ...PERFIS_NAO_CLIENTE]
      : PERFIS_NAO_CLIENTE;
  }

  constructor(private service: UsuariosPainelService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(pagina?: number): void {
    if (pagina != null) this.paginaAtual = pagina;
    this.carregando = true;
    this.erro = null;
    this.service.listar(this.paginaAtual).subscribe({
      next: (res) => {
        this.usuarios = res.data;
        this.paginaAtual = res.current_page;
        this.ultimaPagina = res.last_page;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os usuários.';
        this.carregando = false;
      },
    });
  }

  abrirNovo(): void {
    this.modalEdicao = null;
    this.form = { nome: '', email: '', senha: '', tipo_perfil: 'VENDEDOR', ativo: true };
    this.formErro = null;
    this.modalAberto = true;
  }

  abrirEditar(u: UsuarioPainel): void {
    this.modalEdicao = u;
    this.form = {
      nome: u.nome,
      email: u.email ?? '',
      senha: '',
      tipo_perfil: u.tipo_perfil,
      ativo: !!u.ativo,
    };
    this.formErro = null;
    this.modalAberto = true;
  }

  fecharModal(): void {
    if (!this.enviando) this.modalAberto = false;
  }

  get modalTitulo(): string {
    return this.modalEdicao ? 'Editar usuário' : 'Novo usuário';
  }

  salvar(): void {
    this.formErro = null;
    if (!this.form.nome?.trim()) {
      this.formErro = 'Preencha o nome.';
      return;
    }
    if (!this.modalEdicao && !this.form.senha?.trim()) {
      this.formErro = 'Preencha a senha.';
      return;
    }
    if (this.form.senha && this.form.senha.length < 4) {
      this.formErro = 'A senha deve ter no mínimo 4 caracteres.';
      return;
    }

    this.enviando = true;
    if (this.modalEdicao) {
      const payload: UsuarioUpdate = {
        nome: this.form.nome.trim(),
        email: this.form.email.trim() || undefined,
        tipo_perfil: this.form.tipo_perfil,
        ativo: this.form.ativo,
      };
      if (this.form.senha?.trim()) payload.senha = this.form.senha;
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
      const payload: UsuarioCreate = {
        nome: this.form.nome.trim(),
        email: this.form.email.trim(),
        senha: this.form.senha,
        tipo_perfil: this.form.tipo_perfil,
        ativo: this.form.ativo,
      };
      this.service.criar(payload).subscribe({
        next: () => {
          this.enviando = false;
          this.modalAberto = false;
          this.carregar();
        },
        error: (err) => {
          this.formErro = err.error?.message || 'Não foi possível criar o usuário.';
          this.enviando = false;
        },
      });
    }
  }

  formatarPerfil(tipo: string): string {
    if (!tipo) return '';
    return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
  }

  excluir(usuario: UsuarioPainel): void {
    if (!confirm(`Excluir o usuário "${usuario.nome}"?`)) return;
    this.service.excluir(usuario.id).subscribe({
      next: () => this.carregar(),
      error: (err) => {
        const msg = err.error?.message || err.error?.error || 'Não foi possível excluir o usuário.';
        alert(msg);
      },
    });
  }
}
