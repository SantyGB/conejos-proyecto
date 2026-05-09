import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-salud',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salud.html',
  styleUrls: ['./salud.scss']
})
export class SaludComponent {

  seleccionar(event: Event) {

    const option = event.target as HTMLElement;

    const parent = option.parentElement;

    if (parent) {

      parent.querySelectorAll('.option')
      .forEach(o => o.classList.remove('active'));

      option.classList.add('active');
    }
  }

}