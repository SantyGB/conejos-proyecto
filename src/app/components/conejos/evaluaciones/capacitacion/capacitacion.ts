import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-capacitacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './capacitacion.html',
  styleUrls: ['./capacitacion.scss']
})
export class CapacitacionComponent implements OnInit {

  // ===== FINCA =====

  fincaNombre: string = '';

  // ===== ESTADO =====

  cantidadPersonal: number = 0;

  observaciones: string = '';

  respuestas: any = {
    conocimiento_bienestar: '',
    protocolo_sacrificio: '',
    protocolo_eutanasia: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  // ===== INIT =====

  ngOnInit(): void {

    const nombre =
      localStorage.getItem('finca_nombre');

    if (nombre) {

      this.fincaNombre = nombre;

    }

  }

  // ===== SELECCIONAR =====

  seleccionar(
    valor: string,
    campo: string
  ): void {

    this.respuestas[campo] = valor;

    console.log(
      'Seleccionado:',
      campo,
      valor
    );

  }

  // ===== PUNTAJES =====

obtenerPuntajePersonal(): number {

  switch (this.respuestas.conocimiento_bienestar) {

    case 'Todas las personas demuestran conocimiento y tienen certificación escrita':
      return 100;

    case 'Más del 50% con conocimiento y certificación':
      return 80;

    case '100% con conocimiento pero sin certificación':
      return 60;

    case 'Más del 50% con conocimiento pero sin certificación':
      return 40;

    case 'Menos del 50% con conocimiento y sin certificación':
      return 20;

    default:
      return 0;

  }

}

obtenerPuntajeSacrificio(): number {

  switch (this.respuestas.protocolo_sacrificio) {

    case 'Existe protocolo escrito, registros y evita dolor innecesario':
      return 100;

    case 'No existe protocolo ni registros':
      return 0;

    default:
      return 0;

  }

}

obtenerPuntajeEutanasia(): number {

  switch (this.respuestas.protocolo_eutanasia) {

    case 'Existe protocolo firmado por MV/MVZ y acorde OMSA':
      return 100;

    case 'No existe evidencia documental o no cumple requisitos':
      return 0;

    default:
      return 0;

  }

}

  // ===== GUARDAR =====

  async guardar(): Promise<void> {

    const fincaId =
      localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');

      return;

    }

    // ===== PUNTAJES =====

    const personalPuntaje =
      this.obtenerPuntajePersonal();

    const sacrificioPuntaje =
      this.obtenerPuntajeSacrificio();

    const eutanasiaPuntaje =
      this.obtenerPuntajeEutanasia();

    console.log(
      'PUNTAJES:',
      personalPuntaje,
      sacrificioPuntaje,
      eutanasiaPuntaje
    );

    // ===== PAYLOAD =====

    const payload = {

      finca_id: fincaId,

      cantidad_personal:
        this.cantidadPersonal,

      personal_capacitado:
        this.respuestas.conocimiento_bienestar,

      protocolo_sacrificio:
        this.respuestas.protocolo_sacrificio,

      protocolo_eutanasia:
        this.respuestas.protocolo_eutanasia,

      personal_capacitado_puntaje:
        personalPuntaje,

      protocolo_sacrificio_puntaje:
        sacrificioPuntaje,

      protocolo_eutanasia_puntaje:
        eutanasiaPuntaje,

      observaciones:
        this.observaciones || null

    };

    console.log(
      'CAPACITACION PAYLOAD',
      payload
    );

    // ===== INSERT =====

    console.log(payload);

    const { error } =
      await this.supabaseService.supabase
        .from('capacitacion')
        .insert([payload]);

    if (error) {

      console.log(error);

      alert('Error guardando capacitación');

      return;

    }

    // ===== EVALUACION =====

    await this.supabaseService.supabase
      .from('evaluaciones')
      .upsert(
        [
          {
            finca_id: fincaId,
            tipo: 'capacitacion'
          }
        ],
        {
          onConflict: 'finca_id,tipo'
        }
      );

    alert(
      'Capacitación guardada correctamente'
    );

    this.router.navigate([
      '/evaluaciones'
    ]);

  }

}