import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.component.html', // separando o HTML
})
export class AppComponent {
  usuarios: any[] = [];

  constructor(private http: HttpClient) {
    this.http
      .get<any[]>(
        'http://localhost/DonaBEll/teste-com-banco/sig-backend/usuarios.php'
      )
      .subscribe({
        next: (data) => {
          console.log('Resposta do PHP:', data);
          this.usuarios = data;
        },
        error: (err) => {
          console.error('Erro na requisição', err);
          alert('Erro ao buscar usuários, veja o console');
        },
      });
  }
}
