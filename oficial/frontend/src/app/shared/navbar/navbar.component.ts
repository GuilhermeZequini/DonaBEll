import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  exibirLogo: boolean = true;

  itensMenu = [
    { label: 'Home', link: '/' },
    { label: 'Login', link: '/pessoa/login' },
    { label: 'Contato', link: '/contato' }
  ];

}
