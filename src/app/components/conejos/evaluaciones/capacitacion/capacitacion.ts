import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-capacitacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './capacitacion.html',
  styleUrls: ['./capacitacion.scss']
})
export class CapacitacionComponent {

  seleccionar(event: Event) {

    const opcion = event.target as HTMLElement;

    const grupo = opcion.parentElement;

    if (grupo) {

      grupo.querySelectorAll('.option').forEach(el => {
        el.classList.remove('active');
      });

      opcion.classList.add('active');
    }
  }

}