import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  promedioGeneral = 0;

  totalGranjas = 0;

  evaluaciones = 0;

  evaluacionesRecientes: any[] = [];

  promedioAlimentacion = 0;

  promedioInstalaciones = 0;

  promedioSalud = 0;

  async ngOnInit() {

    await this.cargarDashboard();

  }

async cargarDashboard() {

  // TOTAL GRANJAS
  const { count } = await this.supabaseService.supabase
    .from('fincas')
    .select('*', {
      count: 'exact',
      head: true
    });

  this.totalGranjas = count || 0;

  // EVALUACIONES
  const { data, error } = await this.supabaseService.supabase
    .from('evaluacion_final')
    .select(`
      *,
      fincas(nombre_finca)
    `)
    .order('created_at', {
      ascending: false
    });

  console.log(data);
  console.log(error);

  if (error) {
    console.error(error);
    return;
  }

  if (!data) return;

  this.evaluaciones = data.length;

  // PROMEDIO GENERAL
  const suma = data.reduce(
    (acc, item) =>
      acc + Number(item.resultado_total || 0),
    0
  );

  this.promedioGeneral =
    data.length > 0
      ? +(suma / data.length).toFixed(1)
      : 0;

  // EVALUACIONES RECIENTES
  this.evaluacionesRecientes = data.map(item => ({
    nombre_finca:
      item.fincas?.nombre_finca || 'Sin finca',

    puntaje_total:
      item.resultado_total || 0,

    created_at:
      item.created_at
  }));

  // PROMEDIOS
  const sumaMBR = data.reduce(
    (acc, item) =>
      acc + Number(item.puntaje_mbr || 0),
    0
  );

  const sumaMBA = data.reduce(
    (acc, item) =>
      acc + Number(item.puntaje_mba || 0),
    0
  );

  const sumaMBG = data.reduce(
    (acc, item) =>
      acc + Number(item.puntaje_mbg || 0),
    0
  );

  this.promedioAlimentacion =
    data.length > 0
      ? Math.round(sumaMBR / data.length)
      : 0;

  this.promedioInstalaciones =
    data.length > 0
      ? Math.round(sumaMBA / data.length)
      : 0;

  this.promedioSalud =
    data.length > 0
      ? Math.round(sumaMBG / data.length)
      : 0;
}

  obtenerColor(puntaje: number): string {

    if (puntaje >= 90) return '#22c55e';

    if (puntaje >= 75) return '#3b82f6';

    if (puntaje >= 50) return '#f59e0b';

    return '#ef4444';
  }

  obtenerClasificacion(puntaje: number): string {

    if (puntaje >= 90) return 'Excelente';

    if (puntaje >= 75) return 'Alto';

    if (puntaje >= 50) return 'Medio';

    return 'Bajo';
  }
}