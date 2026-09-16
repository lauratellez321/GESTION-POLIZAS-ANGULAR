import { TestBed } from '@angular/core/testing';
import { Poliza } from '../../core/polizas-api';
import { PolicyList } from './policy-list';

describe('PolicyList', () => {
  it('emite la póliza seleccionada', async () => {
    const fixture = TestBed.createComponent(PolicyList);
    const poliza = {
      id: 7,
      tipo: 'INDIVIDUAL',
      estado: 'VIGENTE',
      canonMensual: 1000000,
    } as Poliza;
    fixture.componentRef.setInput('polizas', [poliza]);
    const seleccionadas: Poliza[] = [];
    fixture.componentInstance.select.subscribe((valor) => seleccionadas.push(valor));
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.policy-row') as HTMLButtonElement).click();
    expect(seleccionadas).toEqual([poliza]);
  });
});
