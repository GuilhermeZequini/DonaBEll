import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (aberto) {
      <div class="modal-overlay" role="presentation">
        <div class="modal-box" role="dialog">
          <h2 class="modal-titulo">{{ titulo }}</h2>
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      .modal-box {
        background: #fff;
        border-radius: 12px;
        max-width: min(900px, 92vw);
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
      }
      .modal-titulo {
        margin: 0;
        padding: 1.25rem 1.5rem;
        font-size: 1.25rem;
        font-weight: 700;
        color: #111;
        border-bottom: 1px solid #e5e7eb;
      }
    `,
  ],
})
export class ModalComponent {
  @Input() aberto = false;
  @Input() titulo = '';
  @Output() fechar = new EventEmitter<void>();
}
