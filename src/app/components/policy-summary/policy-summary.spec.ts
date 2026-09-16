import { TestBed } from '@angular/core/testing';
import { Poliza } from '../../core/polizas-api';
import { PolicySummary } from './policy-summary';

describe('PolicySummary', () => {
  it('calcula los totales según las pólizas recibidas', async () => {
    const fixture = TestBed.createComponent(PolicySummary);
    fixture.componentRef.setInput('polizas', [
      { id: 1, tipo: 'COLECTIVA', estado: 'VIGENTE' },
      { id: 2, tipo: 'INDIVIDUAL', estado: 'CANCELADA' },
    ] as Poliza[]);
    await fixture.whenStable();

    expect(fixture.componentInstance.vigentes()).toBe(1);
    expect(fixture.componentInstance.colectivas()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('2');
  });
});
