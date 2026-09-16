import { TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('muestra el acceso a pólizas', async () => {
    const fixture = TestBed.createComponent(Sidebar);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Pólizas');
  });
});
