import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TipoPoliza = 'INDIVIDUAL' | 'COLECTIVA';
export type EstadoPoliza = 'VIGENTE' | 'RENOVADA' | 'CANCELADA';
export type EstadoRiesgo = 'ACTIVO' | 'CANCELADO';

export interface Poliza {
  id: number;
  tipo: TipoPoliza;
  estado: EstadoPoliza;
  canonMensual: number;
  prima: number;
  inicioVigencia: string;
  finVigencia: string;
  mesesVigencia: number;
}

export interface Riesgo {
  id: number;
  descripcion: string;
  estado: EstadoRiesgo;
  polizaId: number;
}

@Injectable({ providedIn: 'root' })
export class PolizasApi {
  private readonly http = inject(HttpClient);
  private apiKey = '123456';

  cambiarClave(valor: string): void {
    this.apiKey = valor.trim();
  }

  listar(tipo?: TipoPoliza, estado?: EstadoPoliza): Observable<Poliza[]> {
    let params = new HttpParams();
    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Poliza[]>('/polizas', { headers: this.headers(), params });
  }

  riesgos(polizaId: number): Observable<Riesgo[]> {
    return this.http.get<Riesgo[]>(`/polizas/${polizaId}/riesgos`, { headers: this.headers() });
  }

  renovar(polizaId: number, ipcPorcentaje: number): Observable<Poliza> {
    return this.http.post<Poliza>(
      `/polizas/${polizaId}/renovar`,
      { ipcPorcentaje },
      { headers: this.headers() },
    );
  }

  cancelar(polizaId: number): Observable<Poliza> {
    return this.http.post<Poliza>(`/polizas/${polizaId}/cancelar`, {}, { headers: this.headers() });
  }

  agregarRiesgo(polizaId: number, descripcion: string): Observable<Riesgo> {
    return this.http.post<Riesgo>(
      `/polizas/${polizaId}/riesgos`,
      { descripcion },
      { headers: this.headers() },
    );
  }

  cancelarRiesgo(riesgoId: number): Observable<Riesgo> {
    return this.http.post<Riesgo>(`/riesgos/${riesgoId}/cancelar`, {}, { headers: this.headers() });
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'x-api-key': this.apiKey });
  }
}
