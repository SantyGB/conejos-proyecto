import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conejos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './conejos.html',
  styleUrls: ['./conejos.scss']
})
export class ConejosComponent {

  totalConejos: number = 0;

  gruposSeleccionados: string[] = [];

  grupos = [
    'Gazapos',
    'Levante / Engorde',
    'Hembras de cría',
    'Machos reproductores'
  ];

  toggleGrupo(grupo: string) {

    if(this.gruposSeleccionados.includes(grupo)) {

      this.gruposSeleccionados =
        this.gruposSeleccionados.filter(g => g !== grupo);

    } else {

      this.gruposSeleccionados.push(grupo);

    }

  }

  estaActivo(grupo: string): boolean {

    return this.gruposSeleccionados.includes(grupo);

  }

  get muestra(): string {

    if(this.totalConejos > 0) {

      return Math.round(this.totalConejos * 0.2)
        + ' conejos';

    }

    return 'Se calcula automáticamente';

  }

}