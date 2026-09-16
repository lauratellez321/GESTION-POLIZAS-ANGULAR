import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PolizasApi } from './core/polizas-api';
import { App } from './app';

describe('App', () => {
  it('muestra el panel y carga el listado', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PolizasApi,
          useValue: { listar: () => of([]) },
        },
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Pólizas');
    expect(fixture.nativeElement.textContent).not.toContain('Clave API');
    expect(fixture.nativeElement.textContent).not.toContain('Conectar');
    expect(fixture.nativeElement.textContent).toContain('No hay pólizas');
  });
});
