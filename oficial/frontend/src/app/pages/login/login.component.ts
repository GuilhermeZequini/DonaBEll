import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  login: string = '';
  senha: string = '';

  constructor(private router: Router) {}

  onBotaoClicado(): void {
    if (this.login.trim() !== '' && this.senha.trim() !== '') {
      if (this.login === 'admin' && this.senha === 'admin') {
        this.router.navigate(['/pessoa']);
      }
      else {
        alert('Login ou senha incorretos.');
      }
    }
    else {
      alert('Por favor, preencha todos os campos.');
    }
  }
}
