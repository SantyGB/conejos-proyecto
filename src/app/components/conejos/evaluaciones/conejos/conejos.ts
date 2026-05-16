import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-conejos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './conejos.html',
  styleUrls: ['./conejos.scss']
})
export class ConejosComponent {

  totalConejos: number = 0;
  cantidadJaulas: number = 0;

  gruposSeleccionados: string[] = [];

  grupos = [
    'Gazapos',
    'Levante / Engorde',
    'Hembras de cría',
    'Machos reproductores'
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  toggleGrupo(grupo: string) {

    if (this.gruposSeleccionados.includes(grupo)) {

      this.gruposSeleccionados =
        this.gruposSeleccionados.filter(g => g !== grupo);

    } else {

      this.gruposSeleccionados.push(grupo);

    }

  }

  estaActivo(grupo: string): boolean {

    return this.gruposSeleccionados.includes(grupo);

  }

  get muestra(): string {

    if (this.totalConejos > 0) {

      return Math.round(this.totalConejos * 0.2)
        + ' conejos';

    }

    return 'Se calcula automáticamente';

  }

  async guardar() {

    // obtenemos la finca actual guardada
    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) {
      alert('No hay finca seleccionada');
      return;
    }

    const { error } = await this.supabaseService.supabase
      .from('conejos')
      .insert([
        {
          finca_id: fincaId,
          total_conejos: this.totalConejos,
          cantidad_jaulas: this.cantidadJaulas,
          grupos: this.gruposSeleccionados
        }
      ]);

    if (error) {

      console.log(error);
      alert('Error guardando datos');

      return;
    }

    alert('Datos de conejos guardados');

    // siguiente módulo
    this.router.navigate(['/evaluaciones/alimentacion']);

  }

}