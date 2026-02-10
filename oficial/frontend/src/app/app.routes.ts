import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PessoasListagemComponent } from './pages/pessoas-listagem/pessoas-listagem.component';
import { SobreComponent } from './pages/sobre/sobre.component';
import { ContatoComponent } from './pages/contato/contato.component';

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
    }



];
