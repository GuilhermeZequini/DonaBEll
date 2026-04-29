import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PedidosPainelService, PedidoPainel, PedidoCreate, ItemPedidoPainel } from '../../../../services/pedidos-painel.service';
import { ClientesPainelService, ClientePainel } from '../../../../services/clientes-painel.service';
import { ProdutosPainelService, ProdutoPainel } from '../../../../services/produtos-painel.service';
import { AuthService } from '../../../../services/auth.service';
import { ModalComponent } from '../../../../shared/modal/modal.component';

const STATUS_LABELS: Record<string, string> = {
  NOVO: 'Novo',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  EM_PRODUCAO: 'Em produção',
  PRONTO: 'Pronto',
  EM_ENTREGA: 'Em entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-pedidos-listagem',
  standalone: true,
  imports: [FormsModule, DatePipe, ModalComponent],
  templateUrl: './pedidos-listagem.component.html',
  styleUrl: './pedidos-listagem.component.scss',
})
export class PedidosListagemComponent implements OnInit {
  pedidos: PedidoPainel[] = [];
  carregando = true;
  erro: string | null = null;
  paginaAtual = 1;
  ultimaPagina = 1;
  total = 0;
  filtroStatus = '';
  /** Permite abrir vários pedidos ao mesmo tempo. */
  pedidosExpandidos = new Set<number>();

  clientes: ClientePainel[] = [];
  produtos: ProdutoPainel[] = [];

  modalAberto = false;
  modalEdicao: PedidoPainel | null = null;
  enviando = false;
  formErro: string | null = null;

  formClienteId: number | null = null;
  formItens: { Produto_id: number; quantidade: number; produto_nome?: string }[] = [];
  formObservacao = '';

  get isGerente(): boolean {
    return this.authService.getUsuario()?.tipo_perfil === 'GERENTE';
  }

  constructor(
    private service: PedidosPainelService,
    private clientesService: ClientesPainelService,
    private produtosService: ProdutosPainelService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(pagina?: number): void {
    if (pagina != null) this.paginaAtual = pagina;
    this.carregando = true;
    this.erro = null;
    const status = this.filtroStatus || undefined;
    this.service.listar(status, undefined, this.paginaAtual).subscribe({
      next: (res) => {
        this.pedidos = res.data;
        this.paginaAtual = res.current_page;
        this.ultimaPagina = res.last_page;
        this.total = res.total;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os pedidos.';
        this.carregando = false;
      },
    });
  }

  alternarDetalhes(pedidoId: number): void {
    if (this.pedidosExpandidos.has(pedidoId)) this.pedidosExpandidos.delete(pedidoId);
    else this.pedidosExpandidos.add(pedidoId);
  }

  detalhesAbertos(pedidoId: number): boolean {
    return this.pedidosExpandidos.has(pedidoId);
  }

  abrirNovo(): void {
    this.modalEdicao = null;
    this.formClienteId = null;
    this.formItens = [{ Produto_id: 0, quantidade: 1 }];
    this.formObservacao = '';
    this.formErro = null;
    this.carregarClientesProdutos();
    this.modalAberto = true;
  }

  abrirEditar(p: PedidoPainel): void {
    if (p.status !== 'NOVO') return;
    this.modalEdicao = p;
    this.formClienteId = p.Cliente_Usuario_id;
    this.formItens = (p.itens || []).map((i) => ({
      Produto_id: i.Produto_id,
      quantidade: i.quantidade,
      produto_nome: i.produto_nome ?? undefined,
    }));
    if (this.formItens.length === 0) this.formItens = [{ Produto_id: 0, quantidade: 1 }];
    this.formObservacao = p.observacao ?? '';
    this.formErro = null;
    this.carregarClientesProdutos();
    this.modalAberto = true;
  }

  private carregarClientesProdutos(): void {
    this.clientesService.listar(undefined, undefined, 1, 100).subscribe({
      next: (res) => (this.clientes = res.data),
      error: () => (this.clientes = []),
    });
    this.produtosService.listar(true, 1, 100).subscribe({
      next: (res) => (this.produtos = res.data),
      error: () => (this.produtos = []),
    });
  }

  fecharModal(): void {
    if (!this.enviando) this.modalAberto = false;
  }

  get modalTitulo(): string {
    return this.modalEdicao ? 'Editar pedido' : 'Novo pedido';
  }

  adicionarItem(): void {
    this.formItens.push({ Produto_id: 0, quantidade: 1 });
  }

  removerItem(index: number): void {
    if (this.formItens.length > 1) this.formItens.splice(index, 1);
  }

  nomeProduto(produtoId: number): string {
    return this.produtos.find((x) => x.id === produtoId)?.nome ?? '—';
  }

  salvar(): void {
    this.formErro = null;
    if (!this.formClienteId) {
      this.formErro = 'Selecione o cliente.';
      return;
    }
    const itens = this.formItens
      .filter((i) => i.Produto_id > 0 && i.quantidade > 0)
      .map((i) => ({ Produto_id: i.Produto_id, quantidade: i.quantidade }));
    if (itens.length === 0) {
      this.formErro = 'Adicione ao menos um item com produto e quantidade.';
      return;
    }

    this.enviando = true;
    const payload: PedidoCreate = {
      Cliente_Usuario_id: this.formClienteId,
      itens,
      observacao: this.formObservacao.trim() || undefined,
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
          this.formErro = err.error?.message || 'Não foi possível criar o pedido.';
          this.enviando = false;
        },
      });
    }
  }

  aprovar(p: PedidoPainel): void {
    if (p.status !== 'NOVO') return;
    this.service.aprovar(p.id).subscribe({
      next: () => this.carregar(),
      error: (err) => alert(err.error?.message || 'Não foi possível aprovar.'),
    });
  }

  rejeitar(p: PedidoPainel): void {
    if (p.status !== 'NOVO') return;
    this.service.rejeitar(p.id).subscribe({
      next: () => this.carregar(),
      error: (err) => alert(err.error?.message || 'Não foi possível rejeitar.'),
    });
  }

  excluir(p: PedidoPainel): void {
    if (p.status !== 'NOVO' && p.status !== 'REJEITADO') return;
    if (!confirm(`Excluir o pedido #${p.id}?`)) return;
    this.service.excluir(p.id).subscribe({
      next: () => this.carregar(),
      error: () => alert('Não foi possível excluir o pedido.'),
    });
  }

  statusLabel(s: string): string {
    return STATUS_LABELS[s] ?? s;
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      NOVO: 'status-badge--novo',
      APROVADO: 'status-badge--aprovado',
      REJEITADO: 'status-badge--rejeitado',
      EM_PRODUCAO: 'status-badge--em-producao',
      PRONTO: 'status-badge--pronto',
      EM_ENTREGA: 'status-badge--em-entrega',
      ENTREGUE: 'status-badge--entregue',
      CANCELADO: 'status-badge--cancelado',
    };
    return `status-badge ${map[status] ?? 'status-badge--default'}`;
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
}
