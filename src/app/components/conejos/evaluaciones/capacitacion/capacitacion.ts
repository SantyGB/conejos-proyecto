import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-capacitacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './capacitacion.html',
  styleUrls: ['./capacitacion.scss']
})
export class CapacitacionComponent {

  personalCapacitado: string = '';
  protocoloSacrificio: string = '';
  protocoloEutanasia: string = '';
  planContingencia: string = '';

  constructor(
    private supabaseService: SupabaseService
  ) {}

  seleccionar(
    event: Event,
    campo: string
  ) {

    const opcion = event.target as HTMLElement;

    const grupo = opcion.parentElement;

    if (grupo) {

      grupo.querySelectorAll('.option').forEach(el => {
        el.classList.remove('active');
      });

      opcion.classList.add('active');

      const valor = opcion.innerText.trim();

      switch(campo) {

        case 'personal':
          this.personalCapacitado = valor;
          break;

        case 'sacrificio':
          this.protocoloSacrificio = valor;
          break;

        case 'eutanasia':
          this.protocoloEutanasia = valor;
          break;

        case 'contingencia':
          this.planContingencia = valor;
          break;

      }

    }

  }

  obtenerPuntosPersonal(valor: string): number {

    switch(valor) {

      case 'Todos certificados':
        return 100;

      case 'Más de la mitad certificados':
        return 70;

      case 'Más de la mitad sin certificado':
        return 40;

      case 'Muy pocos capacitados':
        return 0;

      default:
        return 0;

    }

  }

  obtenerPuntosSiNo(valor: string): number {

    switch(valor) {

      case 'Existe y se aplica':
      case 'Completo y firmado':
      case 'Completo e implementado':
        return 100;

      case 'Solo escrito':
        return 60;

      case 'Solo lo conocen':
        return 30;

      case 'No existe':
      case 'Incompleto o no existe':
        return 0;

      default:
        return 0;

    }

  }

  async guardar(): Promise<void> {

    const { data, error } = await this.supabaseService.supabase
      .from('capacitacion')
      .insert([
        {
          personal_capacitado: this.personalCapacitado,

          protocolo_sacrificio: this.protocoloSacrificio,

          protocolo_eutanasia: this.protocoloEutanasia,

          plan_contingencia: this.planContingencia,

          puntos_personal:
            this.obtenerPuntosPersonal(
              this.personalCapacitado
            ),

          puntos_sacrificio:
            this.obtenerPuntosSiNo(
              this.protocoloSacrificio
            ),

          puntos_eutanasia:
            this.obtenerPuntosSiNo(
              this.protocoloEutanasia
            ),

          puntos_contingencia:
            this.obtenerPuntosSiNo(
              this.planContingencia
            )
        }
      ]);

    console.log(data);
    console.log(error);

    if (!error) {
      alert('Capacitación guardada correctamente');
    }

  }

}