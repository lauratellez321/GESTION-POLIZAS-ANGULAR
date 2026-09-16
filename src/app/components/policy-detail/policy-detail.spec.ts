import { TestBed } from '@angular/core/testing';
import { Poliza } from '../../core/polizas-api';
import { PolicyDetail } from './policy-detail';

describe('PolicyDetail', () => {
  it('muestra la vigencia de la póliza recibida', async () => {
    const fixture = TestBed.createComponent(PolicyDetail);
    fixture.componentRef.setInput('poliza', {
      id: 4,
      tipo: 'INDIVIDUAL',
      estado: 'VIGENTE',
      canonMensual: 1000000,
      prima: 12000000,
      mesesVigencia: 12,
      inicioVigencia: '2026-01-01',
      finVigencia: '2026-12-31',
    } as Poliza);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Póliza #4');
    expect(fixture.nativeElement.textContent).toContain('31/12/2026');
  });
});
