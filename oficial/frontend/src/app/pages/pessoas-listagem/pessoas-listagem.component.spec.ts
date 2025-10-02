import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PessoasListagemComponent } from './pessoas-listagem.component';

describe('PessoasListagemComponent', () => {
  let component: PessoasListagemComponent;
  let fixture: ComponentFixture<PessoasListagemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PessoasListagemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PessoasListagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
