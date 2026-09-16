import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PolicyDetail } from './components/policy-detail/policy-detail';
import { PolicyFilters, PolicyList } from './components/policy-list/policy-list';
import { PolicySummary } from './components/policy-summary/policy-summary';
import { Sidebar } from './components/sidebar/sidebar';
import { EstadoPoliza, Poliza, PolizasApi, Riesgo, TipoPoliza } from './core/polizas-api';

@Component({
  selector: 'app-root',
  imports: [FormsModule, Sidebar, PolicySummary, PolicyList, PolicyDetail],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly api = inject(PolizasApi);

  readonly polizas = signal<Poliza[]>([]);
  readonly seleccionada = signal<Poliza | null>(null);
  readonly riesgos = signal<Riesgo[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');

  private tipoFiltro: TipoPoliza | '' = '';
  private estadoFiltro: EstadoPoliza | '' = '';
  claveApi = '123456';

  ngOnInit(): void {
    void this.cargarPolizas();
  }

  aplicarFiltros(filtros: PolicyFilters): void {
    this.tipoFiltro = filtros.tipo;
    this.estadoFiltro = filtros.estado;
    void this.cargarPolizas();
  }

  async cargarPolizas(): Promise<void> {
    this.api.cambiarClave(this.claveApi);
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');
    try {
      const polizas = await firstValueFrom(
        this.api.listar(this.tipoFiltro || undefined, this.estadoFiltro || undefined),
      );
      this.polizas.set(polizas);
      const idActual = this.seleccionada()?.id;
      const actual = polizas.find((p) => p.id === idActual) ?? null;
      this.seleccionada.set(actual);
      if (actual) {
        await this.cargarRiesgos(actual.id);
      } else {
        this.riesgos.set([]);
      }
    } catch (e) {
      this.error.set(this.descripcionError(e));
    } finally {
      this.cargando.set(false);
    }
  }

  async seleccionar(poliza: Poliza): Promise<void> {
    this.seleccionada.set(poliza);
    this.riesgos.set([]);
    this.error.set('');
    await this.cargarRiesgos(poliza.id);
  }

  async renovar(ipc: number): Promise<void> {
    const poliza = this.seleccionada();
    if (!poliza || !Number.isFinite(ipc) || ipc < 0 || ipc > 100) {
      this.error.set('Ingresa un IPC entre 0 y 100.');
      return;
    }
    await this.ejecutar(async () => {
      const actualizada = await firstValueFrom(this.api.renovar(poliza.id, ipc));
      this.reemplazarPoliza(actualizada);
      this.mensaje.set(`La póliza #${poliza.id} se renovó correctamente.`);
    });
  }

  async cancelarPoliza(): Promise<void> {
    const poliza = this.seleccionada();
    if (!poliza || !window.confirm(`¿Cancelar la póliza #${poliza.id} y todos sus riesgos?`))
      return;
    await this.ejecutar(async () => {
      const actualizada = await firstValueFrom(this.api.cancelar(poliza.id));
      this.reemplazarPoliza(actualizada);
      await this.cargarRiesgos(poliza.id);
      this.mensaje.set(`La póliza #${poliza.id} se canceló.`);
    });
  }

  async agregarRiesgo(descripcion: string): Promise<void> {
    const poliza = this.seleccionada();
    if (!poliza || poliza.tipo !== 'COLECTIVA' || !descripcion.trim()) {
      this.error.set('Escribe una descripción para el riesgo.');
      return;
    }
    await this.ejecutar(async () => {
      await firstValueFrom(this.api.agregarRiesgo(poliza.id, descripcion.trim()));
      await this.cargarRiesgos(poliza.id);
      this.mensaje.set('Riesgo agregado a la póliza.');
    });
  }

  async cancelarRiesgo(riesgo: Riesgo): Promise<void> {
    if (!window.confirm(`¿Cancelar el riesgo "${riesgo.descripcion}"?`)) return;
    await this.ejecutar(async () => {
      await firstValueFrom(this.api.cancelarRiesgo(riesgo.id));
      const poliza = this.seleccionada();
      if (poliza) await this.cargarRiesgos(poliza.id);
      this.mensaje.set('Riesgo cancelado.');
    });
  }

  private async cargarRiesgos(polizaId: number): Promise<void> {
    try {
      const riesgos = await firstValueFrom(this.api.riesgos(polizaId));
      if (this.seleccionada()?.id === polizaId) this.riesgos.set(riesgos);
    } catch (e) {
      this.error.set(this.descripcionError(e));
    }
  }

  private reemplazarPoliza(actualizada: Poliza): void {
    this.seleccionada.set(actualizada);
    this.polizas.update((actuales) =>
      actuales.map((p) => (p.id === actualizada.id ? actualizada : p)),
    );
  }

  private async ejecutar(accion: () => Promise<void>): Promise<void> {
    this.guardando.set(true);
    this.error.set('');
    this.mensaje.set('');
    try {
      await accion();
    } catch (e) {
      this.error.set(this.descripcionError(e));
    } finally {
      this.guardando.set(false);
    }
  }

  private descripcionError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0)
        return 'No se pudo conectar con la API. Comprueba que Spring Boot esté en el puerto 8080.';
      if (e.status === 401) return 'La clave API no es válida.';
      return e.error?.error || `La solicitud falló (${e.status}).`;
    }
    return 'Ocurrió un error inesperado.';
  }
}
