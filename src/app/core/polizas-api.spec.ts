import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PolizasApi } from './polizas-api';

describe('PolizasApi', () => {
  let api: PolizasApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PolizasApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía filtros y clave API al consultar pólizas', () => {
    api.listar('COLECTIVA', 'VIGENTE').subscribe((polizas) => expect(polizas).toEqual([]));

    const solicitud = http.expectOne(
      (req) =>
        req.url === '/polizas' &&
        req.params.get('tipo') === 'COLECTIVA' &&
        req.params.get('estado') === 'VIGENTE',
    );
    expect(solicitud.request.headers.get('x-api-key')).toBe('123456');
    solicitud.flush([]);
  });
});
