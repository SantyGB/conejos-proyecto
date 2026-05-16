import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-salud',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salud.html',
  styleUrls: ['./salud.scss']
})
export class SaludComponent {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  seleccionar(event: Event) {

    const option = event.target as HTMLElement;

    const parent = option.parentElement;

    if (parent) {

      parent.querySelectorAll('.option')
      .forEach(o => o.classList.remove('active'));

      option.classList.add('active');
    }
  }

  async guardarSalud() {

    const opcionesActivas =
      Array.from(document.querySelectorAll('.option.active'))
      .map(el => (el as HTMLElement).innerText);

    const { data, error } =
      await this.supabaseService.supabase
      .from('salud')
      .insert([
        {
          respuestas: opcionesActivas
        }
      ]);

    console.log(data);
    console.log(error);

    if (!error) {

      alert('Datos de salud guardados');

    }
  }

}