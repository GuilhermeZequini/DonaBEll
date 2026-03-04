import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-painel-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div class="painel-placeholder">
      <h1 class="painel-placeholder__titulo">{{ titulo }}</h1>
      <p class="painel-placeholder__texto">Em breve.</p>
    </div>
  `,
  styles: [
    `
      .painel-placeholder {
        padding: 2rem 0;
      }
      .painel-placeholder__titulo {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
      }
      .painel-placeholder__texto {
        margin: 0;
        color: #666;
      }
    `,
  ],
})
export class PainelPlaceholderComponent {
  titulo = 'Página';

  constructor(private route: ActivatedRoute) {
    const data = this.route.snapshot.data;
    if (data['titulo']) this.titulo = data['titulo'];
  }
}
