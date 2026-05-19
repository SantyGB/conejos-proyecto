import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  RouterOutlet
} from '@angular/router';

import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../../services/supabase.service';
import { FincaService } from '../../../services/finca.service';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  templateUrl: './evaluaciones.html',
  styleUrls: ['./evaluaciones.scss'],
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    FormsModule
  ]
})
export class EvaluacionesComponent implements OnInit {

  fincas: any[] = [];

  fincaSeleccionada: any = null;

  evaluacionesCompletadas: string[] = [];

  totalSecciones = 8;

  constructor(
    private supabaseService: SupabaseService,
    private fincaService: FincaService
  ) {}

  async ngOnInit() {

    await this.cargarFincas();

    const fincaGuardada =
      localStorage.getItem('finca_id');

    if (fincaGuardada) {

      const finca = this.fincas.find(
        f => f.id == fincaGuardada
      );

      if (finca) {

        this.fincaSeleccionada = finca;

        this.fincaService.setFinca(finca);

        await this.cargarEvaluaciones();

      }

    }

  }

  async cargarFincas() {

    const { data, error } =
      await this.supabaseService.supabase
      .from('fincas')
      .select('*')
      .order('id', { ascending: false });

    if (error) {

      console.log(error);
      return;

    }

    this.fincas = data || [];

  }

  async iniciar() {

    if (!this.fincaSeleccionada) {

      alert('Selecciona una finca');
      return;

    }

    this.fincaService.setFinca(
      this.fincaSeleccionada
    );

    localStorage.setItem(
      'finca_id',
      this.fincaSeleccionada.id
    );

    localStorage.setItem(
      'finca_nombre',
      this.fincaSeleccionada.nombre_finca
    );

    await this.cargarEvaluaciones();

    alert(
      'Finca seleccionada correctamente'
    );

  }

  async cargarEvaluaciones() {

    if (!this.fincaSeleccionada) return;

    const { data, error } =
      await this.supabaseService.supabase
      .from('evaluaciones')
      .select('tipo')
      .eq(
        'finca_id',
        this.fincaSeleccionada.id
      );

    if (error) {

      console.log(error);
      return;

    }

    this.evaluacionesCompletadas =
      data?.map((e: any) => e.tipo) || [];

    console.log(
      'Evaluaciones completadas:',
      this.evaluacionesCompletadas
    );

  }

  estaCompleta(tipo: string): boolean {

    return this.evaluacionesCompletadas
      .includes(tipo);

  }

  get seccionesCompletadas(): number {

    return this.evaluacionesCompletadas.length;

  }

  get porcentajeCompletado(): number {

    return Math.round(
      (
        this.seccionesCompletadas /
        this.totalSecciones
      ) * 100
    );

  }

}