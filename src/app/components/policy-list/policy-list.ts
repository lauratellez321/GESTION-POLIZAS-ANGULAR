import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EstadoPoliza, Poliza, TipoPoliza } from '../../core/polizas-api';

export interface PolicyFilters {
  tipo: TipoPoliza | '';
  estado: EstadoPoliza | '';
}

@Component({
  selector: 'app-policy-list',
  imports: [FormsModule],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css',
})
export class PolicyList {
  readonly polizas = input.required<Poliza[]>();
  readonly selectedId = input<number | null>(null);
  readonly loading = input(false);
  readonly filtersChanged = output<PolicyFilters>();
  readonly refresh = output<void>();
  readonly select = output<Poliza>();

  tipoFiltro: TipoPoliza | '' = '';
  estadoFiltro: EstadoPoliza | '' = '';

  aplicarFiltros(): void {
    this.filtersChanged.emit({ tipo: this.tipoFiltro, estado: this.estadoFiltro });
  }

  dinero(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }
}
