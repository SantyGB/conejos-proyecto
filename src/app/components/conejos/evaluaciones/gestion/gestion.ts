import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './gestion.html',
  styleUrls: ['./gestion.scss']
})
export class GestionComponent {

  imagenes: string[] = [];

  observaciones: string = '';

  respuestas: any = {
    mortalidad_gazapos: '',
    mortalidad_engorde: '',
    mortalidad_reproductores: '',
    manejo_predio: '',
    plan_sanitario: '',
    medicamentos_legales: '',
    medicamentos_vencidos: '',
    tratamientos_veterinarios: '',
    registros_veterinarios: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  seleccionar(
    event: Event,
    campo: string
  ) {

    const option = event.target as HTMLElement;

    const parent = option.parentElement;

    if (parent) {

      parent.querySelectorAll('.option')
      .forEach(o => o.classList.remove('active'));

      option.classList.add('active');

      this.respuestas[campo] = option.innerText.trim();

    }
  }

  subirFotos(event: any) {

    const archivos = event.target.files;

    this.imagenes = [];

    for (let file of archivos) {

      this.imagenes.push(file.name);

    }
  }

  async guardar() {

    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');
      return;

    }

    const { error } = await this.supabaseService.supabase
      .from('gestion_predio')
      .insert([
        {
          finca_id: fincaId,

          mortalidad_gazapos:
            this.respuestas.mortalidad_gazapos,

          mortalidad_engorde:
            this.respuestas.mortalidad_engorde,

          mortalidad_reproductores:
            this.respuestas.mortalidad_reproductores,

          manejo_predio:
            this.respuestas.manejo_predio,

          plan_sanitario:
            this.respuestas.plan_sanitario,

          medicamentos_legales:
            this.respuestas.medicamentos_legales,

          medicamentos_vencidos:
            this.respuestas.medicamentos_vencidos,

          tratamientos_veterinarios:
            this.respuestas.tratamientos_veterinarios,

          registros_veterinarios:
            this.respuestas.registros_veterinarios,

          observaciones:
            this.observaciones
        }
      ]);

    if (error) {

      console.log(error);
      alert('Error guardando gestión');

      return;

    }

    alert('Gestión guardada');

    this.router.navigate(['/evaluaciones/capacitacion']);

  }

}