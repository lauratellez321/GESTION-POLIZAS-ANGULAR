import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Poliza, Riesgo } from '../../core/polizas-api';

@Component({
  selector: 'app-policy-detail',
  imports: [FormsModule],
  templateUrl: './policy-detail.html',
  styleUrl: './policy-detail.css',
})
export class PolicyDetail {
  readonly poliza = input<Poliza | null>(null);
  readonly riesgos = input<Riesgo[]>([]);
  readonly guardando = input(false);
  readonly renovar = output<number>();
  readonly cancelarPoliza = output<void>();
  readonly agregarRiesgo = output<string>();
  readonly cancelarRiesgo = output<Riesgo>();

  ipcPorcentaje: number | null = null;
  nuevaDescripcion = '';

  enviarRenovacion(): void {
    if (this.ipcPorcentaje !== null && Number.isFinite(this.ipcPorcentaje)) {
      this.renovar.emit(this.ipcPorcentaje);
    }
  }

  enviarRiesgo(): void {
    const descripcion = this.nuevaDescripcion.trim();
    if (!descripcion) return;
    this.agregarRiesgo.emit(descripcion);
    this.nuevaDescripcion = '';
  }

  dinero(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  fecha(valor: string): string {
    const [anio, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${anio}`;
  }
}
