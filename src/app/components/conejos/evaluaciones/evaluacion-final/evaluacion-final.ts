import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluacion-final',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './evaluacion-final.html',
  styleUrls: ['./evaluacion-final.scss']
})
export class EvaluacionFinalComponent {

  imagenSeleccionada: string | ArrayBuffer | null = null;

  seleccionarOpcion(event: Event) {
    const option = event.target as HTMLElement;

    if (option.classList.contains('option')) {
      const container = option.parentElement;

      container?.querySelectorAll('.option').forEach(o => {
        o.classList.remove('active');
      });

      option.classList.add('active');
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

  guardarEvaluacion() {
    alert('Evaluación guardada correctamente');
  }

}