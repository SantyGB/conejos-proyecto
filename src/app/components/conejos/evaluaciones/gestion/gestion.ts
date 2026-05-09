import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gestion.html',
  styleUrls: ['./gestion.scss']
})
export class GestionComponent {

  imagenes: string[] = [];

  seleccionar(event: Event) {

    const option = event.target as HTMLElement;

    const parent = option.parentElement;

    if (parent) {

      parent.querySelectorAll('.option')
      .forEach(o => o.classList.remove('active'));

      option.classList.add('active');
    }
  }

  subirFotos(event: any) {

    const archivos = event.target.files;

    this.imagenes = [];

    for (let file of archivos) {

      this.imagenes.push(file.name);

    }
  }

}