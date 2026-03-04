import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  login: string = '';
  senha: string = '';
  carregando = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onBotaoClicado(): void {
    if (this.login.trim() === '' || this.senha.trim() === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    this.carregando = true;
    this.authService.login(this.login.trim(), this.senha).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/painel']);
      },
      error: () => {
        this.carregando = false;
        alert('Login ou senha incorretos.');
      },
    });
  }
}
