import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tabela',
  standalone: true,            // Indica que é standalone, não precisa ser declarado em um módulo
  imports: [CommonModule, HttpClientModule], // Importa módulos usados no template
  templateUrl: './tabela-usuarios.component.html' // HTML separado
})
export class TabelaComponent {
  usuarios: any[] = [];

  constructor(private http: HttpClient) {
    // Busca os usuários do backend PHP
    this.http.get<any[]>('http://localhost/usuarios.php')
      .subscribe({
        next: data => this.usuarios = data,
        error: err => console.error('Erro ao buscar usuários', err)
      });
  }

  adicionarUsuario() {
    console.log('Botão de adicionar usuário clicado');
    // Aqui você pode abrir um modal ou redirecionar para um formulário
  }
}
