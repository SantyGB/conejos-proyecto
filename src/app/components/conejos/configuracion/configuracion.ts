import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss']
})
export class ConfiguracionComponent implements OnInit {

  // ─── KPIs dinámicos ────────────────────────────────────────
  totalFincas       = 0;
  totalEvaluaciones = 0;   // filas en tabla evaluaciones (secciones completadas)
  totalResultados   = 0;   // evaluaciones_final guardadas

  // ─── Info de criterios (estática, refleja tu modelo real) ──
  criterios = [
    {
      nombre:      'Registro de la finca',
      descripcion: 'Datos básicos del predio',
      icono:       'home_work',
      indicadores: 14,
      tabla:       'fincas',
      grupo:       '—',
      peso:        '—'
    },
    {
      nombre:      'Datos de los conejos',
      descripcion: 'Población, raza y etapas',
      icono:       'cruelty_free',
      indicadores: 10,
      tabla:       'conejos',
      grupo:       '—',
      peso:        '—'
    },
    {
      nombre:      'Alimentación',
      descripcion: 'Comederos, agua, alimento ICA',
      icono:       'eco',
      indicadores: 14,
      tabla:       'alimentacion',
      grupo:       'MBR (30%)',
      peso:        '50% del MBR'
    },
    {
      nombre:      'Instalaciones',
      descripcion: 'Alojamiento, espacio, condiciones físicas',
      icono:       'warehouse',
      indicadores: 15,
      tabla:       'instalaciones',
      grupo:       'MBR (30%)',
      peso:        '50% del MBR'
    },
    {
      nombre:      'Observación animal',
      descripcion: 'Comportamiento y estado visible',
      icono:       'visibility',
      indicadores: 11,
      tabla:       'observacion_animal',
      grupo:       'MBA (60%)',
      peso:        '50% del MBA'
    },
    {
      nombre:      'Salud',
      descripcion: 'Estado sanitario y signos clínicos (11 indicadores)',
      icono:       'health_and_safety',
      indicadores: 11,
      tabla:       'salud',
      grupo:       'MBA (60%)',
      peso:        '50% del MBA'
    },
    {
      nombre:      'Gestión',
      descripcion: 'Mortalidad, predio, plan sanitario, contingencias',
      icono:       'manage_accounts',
      indicadores: 7,
      tabla:       'gestion',
      grupo:       'MBG (10%)',
      peso:        '50% del MBG'
    },
    {
      nombre:      'Capacitación',
      descripcion: 'Personal capacitado, sacrificio y eutanasia',
      icono:       'school',
      indicadores: 3,
      tabla:       'capacitacion',
      grupo:       'MBG (10%)',
      peso:        '50% del MBG'
    }
  ];

  // ─── Formula ICA ───────────────────────────────────────────
  formulaGrupos = [
    {
      codigo:      'MBR',
      nombre:      'Medidas del Buen Recurso',
      peso:        30,
      componentes: ['Alimentación', 'Instalaciones'],
      color:       'mbr'
    },
    {
      codigo:      'MBA',
      nombre:      'Medidas del Buen Animal',
      peso:        60,
      componentes: ['Observación animal', 'Salud'],
      color:       'mba'
    },
    {
      codigo:      'MBG',
      nombre:      'Medidas del Buen Ganadero',
      peso:        10,
      componentes: ['Gestión', 'Capacitación'],
      color:       'mbg'
    }
  ];

  // ─── Clasificaciones ICA ────────────────────────────────────
  clasificaciones = [
    { rango: '≥ 90%', label: '🏆 Excelente Bienestar', color: 'verde',    descripcion: 'Condiciones óptimas según ICA' },
    { rango: '75–89%', label: '✅ Alto Bienestar',      color: 'azul',     descripcion: 'Buenas condiciones con mejoras menores' },
    { rango: '50–74%', label: '⚠️ Medio Bienestar',    color: 'amarillo', descripcion: 'Afectaciones que deben corregirse' },
    { rango: '< 50%',  label: '🚨 Bajo Bienestar',     color: 'rojo',     descripcion: 'Deficiencias que requieren intervención' }
  ];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarKpis();
  }

  async cargarKpis(): Promise<void> {
    const { count: fincas } = await this.supabase.supabase
      .from('fincas')
      .select('*', { count: 'exact', head: true });

    const { count: evals } = await this.supabase.supabase
      .from('evaluaciones')
      .select('*', { count: 'exact', head: true });

    const { count: finales } = await this.supabase.supabase
      .from('evaluacion_final')
      .select('*', { count: 'exact', head: true });

    this.totalFincas       = fincas   || 0;
    this.totalEvaluaciones = evals    || 0;
    this.totalResultados   = finales  || 0;
  }

  get totalIndicadores(): number {
    return this.criterios.reduce((acc, c) => acc + c.indicadores, 0);
  }
}