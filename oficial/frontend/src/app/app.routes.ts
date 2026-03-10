import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PessoasListagemComponent } from './pages/pessoas-listagem/pessoas-listagem.component';
import { SobreComponent } from './pages/sobre/sobre.component';
import { ContatoComponent } from './pages/contato/contato.component';
import { PainelComponent } from './pages/painel/painel.component';
import { DashboardPainelComponent } from './pages/painel/dashboard/dashboard-painel.component';
import { UsuariosListagemComponent } from './pages/painel/usuarios/usuarios-listagem/usuarios-listagem.component';
import { UsuarioFormComponent } from './pages/painel/usuarios/usuario-form/usuario-form.component';
import { ClientesListagemComponent } from './pages/painel/clientes/clientes-listagem/clientes-listagem.component';
import { RotasListagemComponent } from './pages/painel/rotas/rotas-listagem/rotas-listagem.component';
import { ProdutosListagemComponent } from './pages/painel/produtos/produtos-listagem/produtos-listagem.component';
import { PedidosListagemComponent } from './pages/painel/pedidos/pedidos-listagem/pedidos-listagem.component';
import { ProducaoPainelComponent } from './pages/painel/producao/producao-painel/producao-painel.component';
import { RelatoriosPainelComponent } from './pages/painel/relatorios/relatorios-painel.component';
import { authGuard } from './guards/auth.guard';
import { gerenteGuard } from './guards/gerente.guard';

export const routes: Routes = [
    {
        path: '',
        component : HomeComponent,
        title: 'Home'
    },
    {
        path: 'login',
        component : LoginComponent,
        title: 'Login'
    },

    {
        path : 'pessoa',
        component : PessoasListagemComponent,
        title : 'Pessoas'
    },

    {
      path: 'sobre',
      component:SobreComponent,
      title: 'Sobre'
    },

    {
      path: 'contato',
      component: ContatoComponent,
      title: 'Contato'
    },

    {
      path: 'painel',
      component: PainelComponent,
      canActivate: [authGuard],
      children: [
        { path: '', component: DashboardPainelComponent, title: 'Dashboard' },
        { path: 'pedidos', component: PedidosListagemComponent, title: 'Pedidos' },
        { path: 'producao', component: ProducaoPainelComponent, title: 'Produção' },
        { path: 'rotas', component: RotasListagemComponent, title: 'Rotas', canActivate: [gerenteGuard] },
        { path: 'produtos', component: ProdutosListagemComponent, title: 'Produtos' },
        { path: 'clientes', component: ClientesListagemComponent, title: 'Clientes' },
        { path: 'usuarios', component: UsuariosListagemComponent, title: 'Usuários', canActivate: [gerenteGuard] },
        { path: 'usuarios/novo', component: UsuarioFormComponent, title: 'Novo usuário', canActivate: [gerenteGuard] },
        { path: 'usuarios/editar/:id', component: UsuarioFormComponent, title: 'Editar usuário', canActivate: [gerenteGuard] },
        { path: 'relatorios', component: RelatoriosPainelComponent, title: 'Relatórios' },
      ]
    },
];
