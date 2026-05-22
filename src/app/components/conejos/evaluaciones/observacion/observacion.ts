import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

interface Opcion {

  nombre: string;

  puntaje: number;

  active: boolean;

}

interface Respuesta {

  texto: string;

  puntaje: number;

}

@Component({
  selector: 'app-observacion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './observacion.html',
  styleUrls: ['./observacion.scss']
})
export class ObservacionComponent
implements OnInit {

  // ─────────────────────────────────────
  // FINCA
  // ─────────────────────────────────────

  fincaNombre: string = '';

  fincaId: string = '';

  guardando: boolean = false;

  // ─────────────────────────────────────
  // OPCIONES
  // ─────────────────────────────────────

  comportamientos: Opcion[] = [
    {
      nombre: 'Ningún animal presenta comportamientos anormales',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Hasta el 4% presenta comportamientos anormales',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Más del 4% presenta comportamientos anormales',
      puntaje: 0,
      active: false
    }
  ];

  estirados: Opcion[] = [
    {
      nombre: '20% o más totalmente estirados',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 10% y 19%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Menos del 10%',
      puntaje: 0,
      active: false
    }
  ];

  estres: Opcion[] = [
    {
      nombre: 'Ningún animal presenta estrés térmico',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Menos del 5%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre el 5% y 7%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 7%',
      puntaje: 0,
      active: false
    }
  ];

  mojados: Opcion[] = [
    {
      nombre: 'Ningún animal mojado',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Hasta el 5%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre el 5% y 10%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 10%',
      puntaje: 0,
      active: false
    }
  ];

  aislados: Opcion[] = [
    {
      nombre: 'Ningún animal aislado',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Menos del 5%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre el 5% y 10%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 10%',
      puntaje: 0,
      active: false
    }
  ];

  // ─────────────────────────────────────
  // RESPUESTAS
  // ─────────────────────────────────────

  respuestas: Record<string, Respuesta | null> = {

    comportamientos: null,

    estirados: null,

    estres: null,

    mojados: null,

    aislados: null

  };

  // ─────────────────────────────────────
  // CONSTRUCTOR
  // ─────────────────────────────────────

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  // ─────────────────────────────────────
  // INIT
  // ─────────────────────────────────────

  ngOnInit(): void {

    const nombre =
      localStorage.getItem('finca_nombre');

    const fincaId =
      localStorage.getItem('finca_id');

    if (nombre) {

      this.fincaNombre = nombre;

    }

    if (fincaId) {

      this.fincaId = fincaId;

    }

  }

  // ─────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────

  get seccionesCompletadas(): number {

    return Object.values(this.respuestas)
      .filter(r => r !== null)
      .length;

  }

  get progreso(): number {

    return Math.round(
      (
        this.seccionesCompletadas / 5
      ) * 100
    );

  }

  // ESTE ES EL IMPORTANTE
  // devuelve promedio de 0 a 100

  get puntajeTotal(): number {

    const valores =
      Object.values(this.respuestas)
        .map(r => r?.puntaje ?? 0);

    if (!valores.length) {

      return 0;

    }

    const suma =
      valores.reduce(
        (a, b) => a + b,
        0
      );

    return Number(
      (suma / valores.length)
      .toFixed(2)
    );

  }

  estaCompleta(
    campo: string
  ): boolean {

    return this.respuestas[campo] !== null;

  }

  // ─────────────────────────────────────
  // COLOR PUNTAJE
  // ─────────────────────────────────────

  getColorPuntaje(): string {

    const val =
      this.puntajeTotal;

    if (val >= 90) {

      return '#16a34a';

    }

    if (val >= 75) {

      return '#2563eb';

    }

    if (val >= 50) {

      return '#d97706';

    }

    return '#dc2626';

  }

  // ─────────────────────────────────────
  // TEXTO NIVEL
  // ─────────────────────────────────────

  getNivelTexto(): string {

    const val =
      this.puntajeTotal;

    if (val >= 90) {

      return 'Excelente Bienestar';

    }

    if (val >= 75) {

      return 'Alto Bienestar';

    }

    if (val >= 50) {

      return 'Bienestar Medio';

    }

    return 'Bienestar Bajo';

  }

  // ─────────────────────────────────────
  // SELECCIONAR OPCIÓN
  // ─────────────────────────────────────

  seleccionar(
    opciones: Opcion[],
    opcion: Opcion,
    campo: string
  ): void {

    opciones.forEach(
      o => o.active = false
    );

    opcion.active = true;

    this.respuestas[campo] = {

      texto: opcion.nombre,

      puntaje: opcion.puntaje

    };

  }

  // ─────────────────────────────────────
  // GUARDAR
  // ─────────────────────────────────────

  async guardar(): Promise<void> {

    if (!this.fincaId) {

      alert(
        'No hay finca seleccionada'
      );

      return;

    }

    const completas =
      Object.values(this.respuestas)
        .every(r => r !== null);

    if (!completas) {

      alert(
        'Debes completar todas las preguntas'
      );

      return;

    }

    this.guardando = true;

    try {

      // ─────────────────────────────
      // PAYLOAD
      // ─────────────────────────────

const payload = {

  finca_id: this.fincaId,

  comportamientos_respuesta:
    this.respuestas['comportamientos']?.texto,

  comportamientos_puntaje:
    this.respuestas['comportamientos']?.puntaje,

  estirados_respuesta:
    this.respuestas['estirados']?.texto,

  estirados_puntaje:
    this.respuestas['estirados']?.puntaje,

  estres_respuesta:
    this.respuestas['estres']?.texto,

  estres_puntaje:
    this.respuestas['estres']?.puntaje,

  mojados_respuesta:
    this.respuestas['mojados']?.texto,

  mojados_puntaje:
    this.respuestas['mojados']?.puntaje,

  aislados_respuesta:
    this.respuestas['aislados']?.texto,

  aislados_puntaje:
    this.respuestas['aislados']?.puntaje,

  puntaje_total:
    this.puntajeTotal,

  // 👇 AGREGA ESTO

  subtotal:
    this.puntajeTotal

};

      // ─────────────────────────────
      // GUARDAR TABLA
      // ─────────────────────────────

      const { error } =
        await this.supabaseService.supabase
          .from('observacion_animal')
          .upsert([payload], { onConflict: 'finca_id' });

      if (error) {

        console.error(error);

        alert(
          'Error guardando observación'
        );

        return;

      }

      // ─────────────────────────────
      // EVALUACIONES
      // ─────────────────────────────

      await this.supabaseService.supabase
        .from('evaluaciones')
        .upsert(
          [
            {
              finca_id: this.fincaId,
              tipo: 'observacion'
            }
          ],
          {
            onConflict: 'finca_id,tipo'
          }
        );

      // ─────────────────────────────
      // LOCAL STORAGE
      // ─────────────────────────────

      localStorage.setItem(
        'observacion_completa',
        'true'
      );

      localStorage.setItem(
        'puntaje_observacion',
        this.puntajeTotal.toString()
      );

      // ─────────────────────────────
      // EXITO
      // ─────────────────────────────

      alert(
        'Observación guardada correctamente'
      );

      // ─────────────────────────────
      // SIGUIENTE
      // ─────────────────────────────

      this.router.navigate([
        '/evaluaciones/salud'
      ]);

    } catch (err) {

      console.error(err);

      alert(
        'Ocurrió un error inesperado'
      );

    } finally {

      this.guardando = false;

    }

  }

}