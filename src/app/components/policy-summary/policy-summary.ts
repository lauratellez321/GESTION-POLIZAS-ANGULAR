import { Component, computed, input } from '@angular/core';
import { Poliza } from '../../core/polizas-api';

@Component({
  selector: 'app-policy-summary',
  templateUrl: './policy-summary.html',
  styleUrl: './policy-summary.css',
})
export class PolicySummary {
  readonly polizas = input.required<Poliza[]>();
  readonly vigentes = computed(() => this.polizas().filter((p) => p.estado !== 'CANCELADA').length);
  readonly colectivas = computed(() => this.polizas().filter((p) => p.tipo === 'COLECTIVA').length);
}
