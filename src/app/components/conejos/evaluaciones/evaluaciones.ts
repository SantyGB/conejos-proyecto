import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-evaluaciones',
  templateUrl: './evaluaciones.html',
  styleUrls: ['./evaluaciones.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class EvaluacionesComponent {

  iniciar() {
    console.log('Evaluación iniciada');
  }

}