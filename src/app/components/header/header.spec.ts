import { TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  it('muestra el acceso a pólizas', async () => {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Gestión de pólizas');
  });
});
