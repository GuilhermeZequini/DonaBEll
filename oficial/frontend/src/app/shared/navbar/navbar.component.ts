import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'

})
export class NavbarComponent {
  exibirLogo: boolean = true;

  itensMenu = [
    { label: 'Inicio', link: '/' },
    { label: 'Sobre', link: '/sobre' },
    { label: 'Contato', link: '/contato' },
    { label: 'Login', link: '/login', icon: '/icons/login.svg', isLogin: true }, // ess islongin serve para lincar com a classe css
  ];

}
