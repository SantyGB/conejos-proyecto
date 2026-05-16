import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-evaluacion-final',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './evaluacion-final.html',
  styleUrls: ['./evaluacion-final.scss']
})
export class EvaluacionFinalComponent {

  imagenSeleccionada: string | ArrayBuffer | null = null;

  cantidadAnimales: number = 0;
  evaluador: string = '';
  observacionGeneral: string = '';

  condicionFisica: string = '';
  observacionFisica: string = '';

  comportamiento: string = '';
  observacionComportamiento: string = '';

  resultadoFinal: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  seleccionarOpcion(
    event: Event,
    tipo: string
  ) {

    const option = event.target as HTMLElement;

    if (option.classList.contains('option')) {

      const valor = option.innerText.trim();

      const container = option.parentElement;

      container?.querySelectorAll('.option').forEach(o => {
        o.classList.remove('active');
      });

      option.classList.add('active');

      // guardar selección
      switch (tipo) {

        case 'condicion':
          this.condicionFisica = valor;
          break;

        case 'comportamiento':
          this.comportamiento = valor;
          break;

        case 'resultado':
          this.resultadoFinal = valor;
          break;
      }
    }
  }

  subirImagen(event: any) {

    const file = event.target.files[0];

    if (file) {

      const reader = new FileReader();

      reader.onload = () => {
        this.imagenSeleccionada = reader.result;
      };

      reader.readAsDataURL(file);

    }
  }

  async guardarEvaluacion() {

    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');
      return;

    }

    const { error } = await this.supabaseService.supabase
      .from('evaluacion_final')
      .insert([
        {
          finca_id: fincaId,
          cantidad_animales: this.cantidadAnimales,
          evaluador: this.evaluador,
          condicion_fisica: this.condicionFisica,
          observacion_fisica: this.observacionFisica,
          comportamiento: this.comportamiento,
          observacion_comportamiento: this.observacionComportamiento,
          resultado_final: this.resultadoFinal,
          observacion_general: this.observacionGeneral
        }
      ]);

    if (error) {

      console.log(error);
      alert('Error guardando evaluación');

      return;

    }

    alert('Evaluación guardada correctamente');

    this.router.navigate(['/evaluaciones']);

  }

}