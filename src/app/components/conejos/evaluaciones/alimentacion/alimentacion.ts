import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-alimentacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './alimentacion.html',
  styleUrls: ['./alimentacion.scss']
})
export class AlimentacionComponent implements OnInit {

  constructor(
    public router: Router,
    private supabase: SupabaseService
  ) {}

  // ─────────────────────────────────────────
  // ESTADO UI
  // ─────────────────────────────────────────

  guardando: boolean = false;

  errorGuardar: string = '';

  guardadoExitoso: boolean = false;

  // ─────────────────────────────────────────
  // FINCA
  // ─────────────────────────────────────────

  fincaNombre: string = '';

  fincaId: string = '';

  ngOnInit(): void {

    const fincaId =
      localStorage.getItem('finca_id');

    const fincaNombre =
      localStorage.getItem('finca_nombre');

    if (fincaId) {

      this.fincaId = fincaId;

    }

    if (fincaNombre) {

      this.fincaNombre = fincaNombre;

    }

  }

  // ─────────────────────────────────────────
  // RESPUESTAS
  // ─────────────────────────────────────────

  respuestas: Record<string, number> = {};

  observaciones: string = '';

  // ─────────────────────────────────────────
  // PREGUNTAS
  // ─────────────────────────────────────────

  preguntas: string[] = [

    'comederos_limpios',
    'comederos_mantenimiento',
    'acceso_alimento',

    'alimento_ica',
    'almacenamiento',

    'oferta_forraje',

    'leche_materna',
    'alimento_solido',

    'suficientes_bebederos',
    'agua_voluntad',
    'acceso_agua',
    'calidad_agua',
    'estado_bebederos',
    'altura_bebederos'

  ];

  // ─────────────────────────────────────────
  // BLOQUES
  // ─────────────────────────────────────────

  bloques = [
    {
      nombre: 'Comederos',
      icono: 'restaurant',
      color: '#2563eb',
      keys: [
        'comederos_limpios',
        'comederos_mantenimiento',
        'acceso_alimento'
      ]
    },
    {
      nombre: 'Alimento Balanceado',
      icono: 'verified',
      color: '#0d9488',
      keys: [
        'alimento_ica',
        'almacenamiento'
      ]
    },
    {
      nombre: 'Forraje',
      icono: 'grass',
      color: '#16a34a',
      keys: [
        'oferta_forraje'
      ]
    },
    {
      nombre: 'Gazapos',
      icono: 'pets',
      color: '#7c3aed',
      keys: [
        'leche_materna',
        'alimento_solido'
      ]
    },
    {
      nombre: 'Agua y Bebederos',
      icono: 'water_drop',
      color: '#1d4ed8',
      keys: [
        'suficientes_bebederos',
        'agua_voluntad',
        'acceso_agua',
        'calidad_agua',
        'estado_bebederos',
        'altura_bebederos'
      ]
    }
  ];

  // ─────────────────────────────────────────
  // OPCIONES
  // ─────────────────────────────────────────

  opcionesComederoLimpio = [
    {
      valor: 100,
      texto: 'Todos los comederos cumplen',
      criterio: '100% limpios, en buen estado y permiten acceso al alimento'
    },
    {
      valor: 55,
      texto: 'Más del 80% cumplen',
      criterio: 'Más del 80% limpios, en buen estado y con acceso al alimento'
    },
    {
      valor: 20,
      texto: 'Entre el 61% y 80% cumplen',
      criterio: 'Entre 61% y 80% limpios, en buen estado y con acceso'
    },
    {
      valor: 0,
      texto: 'El 60% o menos cumplen',
      criterio: '60% o menos limpios, en buen estado o con acceso al alimento'
    }
  ];

  opcionesAlimentoBalanceado = [
    {
      valor: 100,
      texto: 'Se cumplen las dos condiciones',
      criterio: 'Registro ICA vigente y almacenamiento adecuado'
    },
    {
      valor: 55,
      texto: 'Solo se cumple una condición',
      criterio: 'Registro ICA o almacenamiento adecuado'
    },
    {
      valor: 0,
      texto: 'No se cumple ninguna condición',
      criterio: 'Sin registro ICA ni almacenamiento adecuado'
    }
  ];

  opcionesForraje = [
    {
      valor: 100,
      texto: 'Existe oferta en pasteras o comederos',
      criterio: 'Forraje disponible con comedero o pastera'
    },
    {
      valor: 55,
      texto: 'Existe oferta pero sin comederos',
      criterio: 'Hay forraje pero sin pasteras'
    },
    {
      valor: 0,
      texto: 'No existe oferta de forraje',
      criterio: 'Los animales no tienen acceso'
    }
  ];

  opcionesGazapos = [
    {
      valor: 100,
      texto: 'Se garantiza y controla el acceso',
      criterio: 'Leche materna y alimento sólido'
    },
    {
      valor: 0,
      texto: 'No se garantiza el acceso',
      criterio: 'No cumplen condiciones'
    }
  ];

  opcionesAgua = [
    {
      valor: 100,
      texto: 'Todos los bebederos cumplen',
      criterio: 'Agua limpia y suficiente'
    },
    {
      valor: 55,
      texto: 'Más del 80% cumplen',
      criterio: 'Más del 80% adecuados'
    },
    {
      valor: 20,
      texto: 'Entre el 50% y 80% cumplen',
      criterio: 'Entre 50% y 80%'
    },
    {
      valor: 0,
      texto: 'No tienen acceso adecuado',
      criterio: 'Menos del 50%'
    }
  ];

  opcionesEstadoBebederos = [
    {
      valor: 100,
      texto: 'Todos en buen estado',
      criterio: '100% funcionales'
    },
    {
      valor: 55,
      texto: 'Más del 80% en buen estado',
      criterio: 'Más del 80% funcionales'
    },
    {
      valor: 20,
      texto: 'Entre el 70% y 80%',
      criterio: '70% a 80%'
    },
    {
      valor: 0,
      texto: 'Menos del 70%',
      criterio: 'Menos del 70%'
    }
  ];

  opcionesAlturaBebederos = [
    {
      valor: 100,
      texto: 'Todos a altura apropiada',
      criterio: 'Altura correcta'
    },
    {
      valor: 55,
      texto: 'Más del 80%',
      criterio: 'Más del 80%'
    },
    {
      valor: 20,
      texto: 'Entre el 70% y 80%',
      criterio: '70% a 80%'
    },
    {
      valor: 0,
      texto: 'Menos del 70%',
      criterio: 'Menos del 70%'
    }
  ];

  // ─────────────────────────────────────────
  // MÉTODOS
  // ─────────────────────────────────────────

  seleccionar(
    key: string,
    valor: number
  ): void {

    this.respuestas[key] = valor;

  }

  calcularSubtotal(): number {

    const valores =
      Object.values(this.respuestas);

    if (!valores.length) {

      return 0;

    }

    return valores.reduce(
      (a, b) => a + b,
      0
    ) / valores.length;

  }

  getPromedioBloque(
    keys: string[]
  ): number {

    const vals = keys
      .filter(
        k => this.respuestas[k] !== undefined
      )
      .map(
        k => this.respuestas[k]
      );

    if (!vals.length) {

      return 0;

    }

    return vals.reduce(
      (a, b) => a + b,
      0
    ) / vals.length;

  }

  getRespondidas(
    keys: string[]
  ): number {

    return keys.filter(
      k => this.respuestas[k] !== undefined
    ).length;

  }

  getTotalRespondidas(): number {

    return this.preguntas.filter(
      k => this.respuestas[k] !== undefined
    ).length;

  }

  // ─────────────────────────────────────────
  // GAUGE
  // ─────────────────────────────────────────

  private readonly CIRCUNFERENCIA = 402.12;

  getGaugeOffset(): number {

    return this.CIRCUNFERENCIA *
      (1 - this.calcularSubtotal() / 100);

  }

  getGaugeColor(): string {

    const val = this.calcularSubtotal();

    if (val >= 90) return '#16a34a';

    if (val >= 75) return '#2563eb';

    if (val >= 50) return '#d97706';

    if (val > 0) return '#dc2626';

    return '#cbd5e1';

  }

  getColorBloque(
    keys: string[]
  ): string {

    const val =
      this.getPromedioBloque(keys);

    if (val >= 90) return '#16a34a';

    if (val >= 75) return '#2563eb';

    if (val >= 50) return '#d97706';

    if (val > 0) return '#dc2626';

    return '#94a3b8';

  }

  getNivelTexto(): string {

    if (!Object.keys(this.respuestas).length) {

      return 'Sin respuestas';

    }

    const val =
      this.calcularSubtotal();

    if (val >= 90) return 'Excelente Bienestar';

    if (val >= 75) return 'Alto Bienestar';

    if (val >= 50) return 'Bienestar Medio';

    return 'Bienestar Bajo';

  }

  // ─────────────────────────────────────────
  // GUARDAR
  // ─────────────────────────────────────────

  async guardar(): Promise<void> {

    if (!this.fincaId) {

      this.errorGuardar =
        'No hay una finca seleccionada';

      return;

    }

    const faltantes =
      this.preguntas.filter(
        p => this.respuestas[p] === undefined
      );

    if (faltantes.length > 0) {

      this.errorGuardar =
        'Debes responder todas las preguntas';

      return;

    }

    this.guardando = true;

    this.errorGuardar = '';

    try {

      const payload = {

        finca_id: this.fincaId,

        comederos_limpios:
          this.respuestas['comederos_limpios'] ?? 0,

        comederos_mantenimiento:
          this.respuestas['comederos_mantenimiento'] ?? 0,

        acceso_alimento:
          this.respuestas['acceso_alimento'] ?? 0,

        alimento_ica:
          this.respuestas['alimento_ica'] ?? 0,

        almacenamiento:
          this.respuestas['almacenamiento'] ?? 0,

        oferta_forraje:
          this.respuestas['oferta_forraje'] ?? 0,

        leche_materna:
          this.respuestas['leche_materna'] ?? 0,

        alimento_solido:
          this.respuestas['alimento_solido'] ?? 0,

        suficientes_bebederos:
          this.respuestas['suficientes_bebederos'] ?? 0,

        agua_voluntad:
          this.respuestas['agua_voluntad'] ?? 0,

        acceso_agua:
          this.respuestas['acceso_agua'] ?? 0,

        calidad_agua:
          this.respuestas['calidad_agua'] ?? 0,

        estado_bebederos:
          this.respuestas['estado_bebederos'] ?? 0,

        altura_bebederos:
          this.respuestas['altura_bebederos'] ?? 0,

        observaciones:
          this.observaciones || null,

        subtotal:
          parseFloat(
            this.calcularSubtotal().toFixed(2)
          )

      };

      // ─────────────────────────────
      // GUARDAR ALIMENTACION
      // ─────────────────────────────

      const { error } =
        await this.supabase.supabase
          .from('alimentacion')
          .upsert([payload], { onConflict: 'finca_id' });

      if (error) {

        console.error(error);

        this.errorGuardar =
          'Error guardando alimentación';

        return;

      }

      // ─────────────────────────────
      // GUARDAR EVALUACION
      // ─────────────────────────────

      const { error: errorEvaluacion } =
        await this.supabase.supabase
          .from('evaluaciones')
          .upsert(
            [
              {
                finca_id: this.fincaId,
                tipo: 'alimentacion'
              }
            ],
            {
              onConflict: 'finca_id,tipo'
            }
          );

      if (errorEvaluacion) {

        console.error(
          'Error evaluaciones:',
          errorEvaluacion
        );

      }

      // ─────────────────────────────
      // LOCAL STORAGE
      // ─────────────────────────────

      localStorage.setItem(
        'alimentacion_completa',
        'true'
      );

      // ─────────────────────────────
      // EXITO
      // ─────────────────────────────

      this.guardadoExitoso = true;

      alert(
        'Alimentación guardada correctamente'
      );

      this.router.navigate([
        '/evaluaciones'
      ]);

    } catch (err) {

      console.error(err);

      this.errorGuardar =
        'Ocurrió un error inesperado';

    } finally {

      this.guardando = false;

    }

  }

}