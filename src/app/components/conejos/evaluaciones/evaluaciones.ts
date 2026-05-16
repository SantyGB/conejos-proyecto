import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../../services/supabase.service';
import { FincaService } from '../../../services/finca.service';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.html',
  styleUrls: ['./evaluaciones.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    FormsModule
  ]
})
export class EvaluacionesComponent {

  fincas: any[] = [];

  fincaSeleccionada: any = null;

  evaluacionesCompletadas: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private fincaService: FincaService
  ) {}

  async ngOnInit() {

    await this.cargarFincas();

    // recuperar finca guardada
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
      .select('*');

    console.log(data);
    console.log(error);

    if (data) {

      this.fincas = data;

    }

  }

  async iniciar() {

    if (!this.fincaSeleccionada) {

      alert('Selecciona una finca');

      return;

    }

    // guardar finca globalmente
    this.fincaService.setFinca(
      this.fincaSeleccionada
    );

    // guardar en localStorage
    localStorage.setItem(
      'finca_id',
      this.fincaSeleccionada.id
    );

    localStorage.setItem(
      'finca_nombre',
      this.fincaSeleccionada.nombre_finca
    );

    await this.cargarEvaluaciones();

    alert('Finca seleccionada correctamente');

  }

  async cargarEvaluaciones() {

    const { data, error } =
      await this.supabaseService.supabase
      .from('evaluaciones')
      .select('*')
      .eq(
        'finca_id',
        this.fincaSeleccionada.id
      );

    console.log(data);
    console.log(error);

    if (data) {

      this.evaluacionesCompletadas =
        data.map((e: any) => e.tipo);

    }

  }

  estaCompleta(tipo: string): boolean {

    return this.evaluacionesCompletadas
      .includes(tipo);

  }

}