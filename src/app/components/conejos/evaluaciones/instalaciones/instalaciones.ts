import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './instalaciones.html',
  styleUrls: ['./instalaciones.scss']
})
export class InstalacionesComponent {

  fotos: string[] = [];

  seleccionar(opciones: any[], opcion: any) {

    opciones.forEach(o => o.active = false);

    opcion.active = true;
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