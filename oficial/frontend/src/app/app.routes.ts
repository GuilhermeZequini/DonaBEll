import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { PessoasListagemComponent } from './pages/pessoas-listagem/pessoas-listagem.component';

export const routes: Routes = [
    {
        path: '',
        component : HomeComponent,
        title: 'Home'
    },
    {
        path: 'pessoa/login',
        component : LoginComponent,
        title: 'Login'
    },

    {
        path : 'pessoa',
        component : PessoasListagemComponent,
        title : 'Pessoas'
    }

];
