import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alimentacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './alimentacion.html',
  styleUrls: ['./alimentacion.scss']
})
export class AlimentacionComponent {

  opcionesSeleccionadas: {
    [key: string]: string
  } = {};

  seleccionar(
    grupo: string,
    opcion: string
  ) {

    this.opcionesSeleccionadas[grupo] = opcion;

  }

}