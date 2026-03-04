import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosPainelService, UsuarioCreate, UsuarioUpdate } from '../../../../services/usuarios-painel.service';

// Clientes são cadastrados apenas na aba Clientes.
const PERFIS_NAO_CLIENTE = ['VENDEDOR', 'GERENTE', 'PRODUCAO', 'ENTREGADOR'];

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit {
  id: number | null = null;
  nome = '';
  email = '';
  senha = '';
  tipo_perfil = 'VENDEDOR';
  ativo = true;
  /** Ao criar: só perfis não-cliente; ao editar usuário CLIENTE inclui CLIENTE para exibir. */
  get perfilOptions(): string[] {
    if (!this.isEdicao || this.tipo_perfil !== 'CLIENTE') return PERFIS_NAO_CLIENTE;
    return ['CLIENTE', ...PERFIS_NAO_CLIENTE];
  }
  carregando = false;
  enviando = false;
  erro: string | null = null;
  isEdicao = false;

  constructor(
    private service: UsuariosPainelService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = +idParam;
      this.isEdicao = true;
      this.carregar();
    }
  }

  carregar(): void {
    if (this.id == null) return;
    this.carregando = true;
    this.erro = null;
    this.service.buscar(this.id).subscribe({
      next: (u) => {
        this.nome = u.nome;
        this.email = u.email ?? '';
        this.tipo_perfil = u.tipo_perfil;
        this.ativo = !!u.ativo;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Usuário não encontrado.';
        this.carregando = false;
      },
    });
  }

  salvar(): void {
    this.erro = null;
    if (!this.nome.trim()) {
      this.erro = 'Preencha o nome.';
      return;
    }
    if (!this.isEdicao && !this.senha.trim()) {
      this.erro = 'Preencha a senha.';
      return;
    }
    if (this.isEdicao && this.senha.trim() && this.senha.length < 4) {
      this.erro = 'A senha deve ter no mínimo 4 caracteres.';
      return;
    }
    if (!this.isEdicao && this.senha.length < 4) {
      this.erro = 'A senha deve ter no mínimo 4 caracteres.';
      return;
    }

    this.enviando = true;
    if (this.isEdicao && this.id != null) {
      const dados: UsuarioUpdate = {
        nome: this.nome.trim(),
        email: this.email.trim() || undefined,
        tipo_perfil: this.tipo_perfil,
        ativo: this.ativo,
      };
      if (this.senha.trim()) dados.senha = this.senha;
      this.service.atualizar(this.id, dados).subscribe({
        next: () => {
          this.enviando = false;
          this.router.navigate(['/painel/usuarios']);
        },
        error: (err) => {
          this.erro = err.error?.message || 'Não foi possível salvar.';
          this.enviando = false;
        },
      });
    } else {
      const dados: UsuarioCreate = {
        nome: this.nome.trim(),
        email: this.email.trim(),
        senha: this.senha,
        tipo_perfil: this.tipo_perfil,
        ativo: this.ativo,
      };
      this.service.criar(dados).subscribe({
        next: () => {
          this.enviando = false;
          this.router.navigate(['/painel/usuarios']);
        },
        error: (err) => {
          this.erro = err.error?.message || 'Não foi possível criar o usuário.';
          this.enviando = false;
        },
      });
    }
  }
}
