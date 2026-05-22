import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../../services/supabase.service';
import { FincaService } from '../../../services/finca.service';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  templateUrl: './evaluaciones.html',
  styleUrls: ['./evaluaciones.scss'],
  imports: [CommonModule, RouterModule, RouterOutlet, FormsModule]
})
export class EvaluacionesComponent implements OnInit {

  fincas: any[]                    = [];
  fincaSeleccionada: any           = null;
  evaluacionesCompletadas: string[] = [];
  totalSecciones                   = 7;

  // ── Toast ────────────────────────────────────────────────────
  toastVisible = false;
  private toastTimer: any;

  constructor(
    private supabaseService: SupabaseService,
    private fincaService: FincaService
  ) {}

  async ngOnInit() {
    await this.cargarFincas();

    const fincaGuardada = localStorage.getItem('finca_id');
    if (fincaGuardada) {
      const finca = this.fincas.find(f => f.id == fincaGuardada);
      if (finca) {
        this.fincaSeleccionada = finca;
        this.fincaService.setFinca(finca);
        await this.cargarEvaluaciones();
      }
    }
  }

  async cargarFincas() {
    const { data, error } = await this.supabaseService.supabase
      .from('fincas')
      .select('*')
      .order('id', { ascending: false });

    if (error) { console.error(error); return; }
    this.fincas = data || [];
  }

  async iniciar() {
    if (!this.fincaSeleccionada) {
      this.mostrarToast('error');
      return;
    }

    this.fincaService.setFinca(this.fincaSeleccionada);
    localStorage.setItem('finca_id', this.fincaSeleccionada.id);
    localStorage.setItem('finca_nombre', this.fincaSeleccionada.nombre_finca);

    await this.cargarEvaluaciones();
    this.mostrarToast('success');
  }

  mostrarToast(tipo: 'success' | 'error') {
    // Cancela cualquier timer previo
    if (this.toastTimer) clearTimeout(this.toastTimer);

    this.toastVisible = true;

    // Se oculta solo a los 3 segundos
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  async cargarEvaluaciones() {
    if (!this.fincaSeleccionada) return;

    const { data, error } = await this.supabaseService.supabase
      .from('evaluaciones')
      .select('tipo')
      .eq('finca_id', this.fincaSeleccionada.id);

    if (error) { console.error(error); return; }

    this.evaluacionesCompletadas = data?.map((e: any) => e.tipo) || [];
  }

  estaCompleta(tipo: string): boolean {
    return this.evaluacionesCompletadas.includes(tipo);
  }

  get seccionesCompletadas(): number {
    return this.evaluacionesCompletadas.length;
  }

  get porcentajeCompletado(): number {
    return Math.round((this.seccionesCompletadas / this.totalSecciones) * 100);
  }
}