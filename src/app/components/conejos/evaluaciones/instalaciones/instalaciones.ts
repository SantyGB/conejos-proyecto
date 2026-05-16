import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './instalaciones.html',
  styleUrls: ['./instalaciones.scss']
})
export class InstalacionesComponent {

  fotos: string[] = [];

  observaciones: string = '';

  respuestas: any = {
    estado_jaulas: '',
    suciedad: '',
    reposa_patas: '',
    nidales: '',
    espacio: '',
    altura: '',
    iluminacion: '',
    ventilacion: '',
    proteccion: ''
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

  subirFotos(event: any) {

    const archivos = event.target.files;

    if (archivos) {

      this.fotos = [];

      for (let file of archivos) {

        this.fotos.push(file.name);

      }
    }
  }

  async guardar() {

    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');
      return;

    }

    const { error } = await this.supabaseService.supabase
      .from('instalaciones')
      .insert([
        {
          finca_id: fincaId,

          estado_jaulas:
            this.respuestas.estado_jaulas,

          suciedad:
            this.respuestas.suciedad,

          reposa_patas:
            this.respuestas.reposa_patas,

          nidales:
            this.respuestas.nidales,

          espacio:
            this.respuestas.espacio,

          altura:
            this.respuestas.altura,

          iluminacion:
            this.respuestas.iluminacion,

          ventilacion:
            this.respuestas.ventilacion,

          proteccion:
            this.respuestas.proteccion,

          observaciones:
            this.observaciones
        }
      ]);

    if (error) {

      console.log(error);
      alert('Error guardando instalaciones');

      return;

    }

    alert('Instalaciones guardadas');

    this.router.navigate(['/evaluaciones/observacion']);

  }

  estadoJaulas = [
    { nombre: 'Todo bien', active: false },
    { nombre: 'Mayoría bien', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'Mal estado', active: false }
  ];

  suciedad = [
    { nombre: 'No hay', active: false },
    { nombre: 'Sí hay', active: false }
  ];

  reposaPatas = [
    { nombre: 'Bien', active: false },
    { nombre: 'Con fallas', active: false },
    { nombre: 'No tienen', active: false }
  ];

  nidales = [
    { nombre: 'Todos cumplen', active: false },
    { nombre: 'Mayoría', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'No cumplen', active: false }
  ];

  espacio = [
    { nombre: 'Adecuado', active: false },
    { nombre: 'Mayoría', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'Insuficiente', active: false }
  ];

  altura = [
    { nombre: 'Correcta', active: false },
    { nombre: 'Mayoría', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'Incorrecta', active: false }
  ];

  iluminacion = [
    { nombre: 'Suficiente', active: false },
    { nombre: 'Mayoría', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'Insuficiente', active: false }
  ];

  ventilacion = [
    { nombre: 'Buena', active: false },
    { nombre: 'Mayoría', active: false },
    { nombre: 'Regular', active: false },
    { nombre: 'Mala', active: false }
  ];

  proteccion = [
    { nombre: 'Buena', active: false },
    { nombre: 'Con fallas', active: false },
    { nombre: 'No tienen', active: false }
  ];

}