import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-observacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './observacion.html',
  styleUrls: ['./observacion.scss']
})
export class ObservacionComponent {

  respuestas: any = {
    comportamientos: '',
    estirados: '',
    estres: '',
    torsion: '',
    mojados: '',
    sucios: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  seleccionar(
    opciones: any[],
    opcion: any,
    campo: string
  ) {

    opciones.forEach(o => o.active = false);

    opcion.active = true;

    this.respuestas[campo] = opcion.nombre;

  }

  async guardar() {

    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');
      return;

    }

    const { error } = await this.supabaseService.supabase
      .from('observacion_animal')
      .insert([
        {
          finca_id: fincaId,

          comportamientos:
            this.respuestas.comportamientos,

          estirados:
            this.respuestas.estirados,

          estres:
            this.respuestas.estres,

          torsion:
            this.respuestas.torsion,

          mojados:
            this.respuestas.mojados,

          sucios:
            this.respuestas.sucios
        }
      ]);

    if (error) {

      console.log(error);
      alert('Error guardando observación');

      return;

    }

    alert('Observación guardada');

    this.router.navigate(['/evaluaciones/salud']);

  }

  comportamientos = [
    { nombre: 'Ninguno', active: false },
    { nombre: 'Bajo', active: false },
    { nombre: 'Alto', active: false }
  ];

  estirados = [
    { nombre: 'Alto', active: false },
    { nombre: 'Medio', active: false },
    { nombre: 'Bajo', active: false }
  ];

  estres = [
    { nombre: 'Ninguno', active: false },
    { nombre: 'Bajo', active: false },
    { nombre: 'Moderado', active: false },
    { nombre: 'Alto', active: false }
  ];

  torsion = [
    { nombre: 'Ninguno', active: false },
    { nombre: 'Moderado', active: false },
    { nombre: 'Severo', active: false },
    { nombre: 'Crítico', active: false }
  ];

  mojados = [
    { nombre: 'Ninguno', active: false },
    { nombre: 'Bajo', active: false },
    { nombre: 'Medio', active: false },
    { nombre: 'Alto', active: false }
  ];

  sucios = [
    { nombre: 'Ninguno', active: false },
    { nombre: 'Moderado', active: false },
    { nombre: 'Severo', active: false },
    { nombre: 'Crítico', active: false }
  ];

}