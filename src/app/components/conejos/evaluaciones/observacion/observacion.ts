import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-observacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './observacion.html',
  styleUrls: ['./observacion.scss']
})
export class ObservacionComponent {

  seleccionar(opciones: any[], opcion: any) {

    opciones.forEach(o => o.active = false);

    opcion.active = true;
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