import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { PolicyDetail } from './components/policy-detail/policy-detail';
import { PolicyFilters, PolicyList } from './components/policy-list/policy-list';
import { PolicySummary } from './components/policy-summary/policy-summary';
import { Header } from './components/header/header';
import { EstadoPoliza, Poliza, PolizasApi, Riesgo, TipoPoliza } from './core/polizas-api';

@Component({
  selector: 'app-root',
  imports: [FormsModule, Header, PolicySummary, PolicyList, PolicyDetail],
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
  private readonly notificarError = effect(() => {
    const texto = this.error();
    if (!texto) return;
    void Swal.fire({
      icon: 'error',
      title: 'No fue posible completar la acción',
      text: texto,
      confirmButtonColor: '#b33d35',
      confirmButtonText: 'Entendido',
    });
  });

  private readonly notificarExito = effect(() => {
    const texto = this.mensaje();
    if (!texto) return;
    void Swal.fire({
      icon: 'success',
      title: 'Operación completada',
      text: texto,
      confirmButtonColor: '#087c50',
      confirmButtonText: 'Aceptar',
    });
  });

  private tipoFiltro: TipoPoliza | '' = '';
  private estadoFiltro: EstadoPoliza | '' = '';
  tipoNuevaPoliza: TipoPoliza = 'INDIVIDUAL';
  nuevoCanonMensual: number | null = null;
  nuevaFechaInicio = '';
  nuevosMesesVigencia: number | null = 12;
  nuevoRiesgoInicial = '';

  ngOnInit(): void {
    void this.cargarPolizas();
  }

  aplicarFiltros(filtros: PolicyFilters): void {
    this.tipoFiltro = filtros.tipo;
    this.estadoFiltro = filtros.estado;
    void this.cargarPolizas();
  }

  async cargarPolizas(): Promise<void> {
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

  async crearPoliza(): Promise<void> {
    if (
      this.nuevoCanonMensual === null ||
      this.nuevoCanonMensual <= 0 ||
      !this.nuevaFechaInicio ||
      this.nuevosMesesVigencia === null ||
      this.nuevosMesesVigencia < 1
    ) {
      this.error.set('Completa los datos requeridos para crear la póliza.');
      return;
    }
    if (this.tipoNuevaPoliza === 'INDIVIDUAL' && !this.nuevoRiesgoInicial.trim()) {
      this.error.set('Una póliza individual debe tener un riesgo inicial.');
      return;
    }

    await this.ejecutar(async () => {
      const creada = await firstValueFrom(
        this.api.crear({
          tipo: this.tipoNuevaPoliza,
          canonMensual: this.nuevoCanonMensual!,
          inicioVigencia: this.nuevaFechaInicio,
          mesesVigencia: this.nuevosMesesVigencia!,
          riesgoInicial: this.nuevoRiesgoInicial,
        }),
      );
      this.polizas.update((actuales) => [creada, ...actuales]);
      this.seleccionada.set(creada);
      this.riesgos.set([]);
      this.nuevoCanonMensual = null;
      this.nuevaFechaInicio = '';
      this.nuevoRiesgoInicial = '';
      this.nuevosMesesVigencia = 12;
      this.mensaje.set(`La póliza #${creada.id} fue creada correctamente.`);
    });
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
    if (!poliza) return;
    const confirmar = await this.confirmarCancelacion(
      '¿Cancelar póliza?',
      `Se cancelará la póliza #${poliza.id} y todos sus riesgos.`,
    );
    if (!confirmar) return;
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
    const confirmar = await this.confirmarCancelacion(
      '¿Cancelar riesgo?',
      `Se cancelará el riesgo “${riesgo.descripcion}”.`,
    );
    if (!confirmar) return;
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

  private async confirmarCancelacion(titulo: string, texto: string): Promise<boolean> {
    const resultado = await Swal.fire({
      icon: 'warning',
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Conservar',
      confirmButtonColor: '#b33d35',
      cancelButtonColor: '#687d70',
    });
    return resultado.isConfirmed;
  }

  private descripcionError(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0)
        return 'No se pudo conectar con la API. Comprueba que Spring Boot esté en el puerto 8080.';
      if (e.status === 401) return 'No se pudo autorizar la solicitud a la API.';
      return e.error?.error || `La solicitud falló (${e.status}).`;
    }
    return 'Ocurrió un error inesperado.';
  }
}
