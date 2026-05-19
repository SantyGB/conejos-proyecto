import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-salud',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salud.html',
  styleUrls: ['./salud.scss']
})
export class SaludComponent implements OnInit {

  // ─────────────────────────────────────────
  // FINCA
  // ─────────────────────────────────────────

  fincaNombre: string = '';

  // ─────────────────────────────────────────
  // ESTADO
  // ─────────────────────────────────────────

  respuestas: any = {};

  puntajeTotal = 0;

  progreso = 0;

  guardando: boolean = false;

  errorGuardar: string = '';

  guardadoExitoso: boolean = false;

  // ─────────────────────────────────────────
  // CONSTRUCTOR
  // ─────────────────────────────────────────

  constructor(
    private supabaseService: SupabaseService,
    public router: Router
  ) {}

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────

  ngOnInit(): void {

    const nombre =
      localStorage.getItem('finca_nombre');

    if (nombre) {

      this.fincaNombre = nombre;

    }

  }

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  seleccionar(
    opciones: any[],
    opcion: any,
    campo: string
  ): void {

    opciones.forEach(o => o.active = false);

    opcion.active = true;

    this.respuestas[campo] = {
      texto: opcion.nombre,
      puntaje: opcion.puntaje
    };

    this.calcularPuntaje();

    this.actualizarProgreso();

  }

  calcularPuntaje(): void {

    const valores = Object.values(this.respuestas)
      .map((item: any) => item?.puntaje || 0);

    if (!valores.length) {

      this.puntajeTotal = 0;

      return;

    }

    const suma = valores.reduce(
      (acc: number, puntaje: number) => acc + puntaje,
      0
    );

    this.puntajeTotal =
      Math.round(suma / valores.length);

  }

  actualizarProgreso(): void {

    const total = 11;

    const respondidas =
      Object.keys(this.respuestas).length;

    this.progreso =
      Math.round((respondidas / total) * 100);

  }

  getRespondidas(): number {

    return Object.keys(this.respuestas).length;

  }

  estaCompleta(campo: string): boolean {

    return !!this.respuestas[campo];

  }

  // ─────────────────────────────────────────
  // GUARDAR
  // ─────────────────────────────────────────

  async guardarSalud(): Promise<void> {

    const fincaId =
      localStorage.getItem('finca_id');

    if (!fincaId) {

      this.errorGuardar =
        'No hay finca seleccionada';

      return;

    }

    this.guardando = true;

    this.errorGuardar = '';

    const payload = {

      finca_id: fincaId,

      torsion_cuello:
        this.respuestas['torsion']?.texto || null,

      suciedad:
        this.respuestas['suciedad']?.texto || null,

      problemas_respiratorios:
        this.respuestas['respiratorio']?.texto || null,

      ojos_secrecion:
        this.respuestas['ojos']?.texto || null,

      condicion_corporal:
        this.respuestas['condicion']?.texto || null,

      lesiones:
        this.respuestas['lesiones']?.texto || null,

      enteropatia:
        this.respuestas['enteropatia']?.texto || null,

      pododermatitis:
        this.respuestas['pododermatitis']?.texto || null,

      diarrea:
        this.respuestas['diarrea']?.texto || null,

      mastitis:
        this.respuestas['mastitis']?.texto || null,

      piel:
        this.respuestas['piel']?.texto || null,

      subtotal:
        this.puntajeTotal

    };

    const { error } =
      await this.supabaseService.supabase
      .from('salud')
      .insert([payload]);

    this.guardando = false;

    if (error) {

      console.error(
        'Error guardando salud:',
        error
      );

      this.errorGuardar =
        'Error al guardar la evaluación';

      return;

    }

    // ─────────────────────────────────────
    // MARCAR COMO COMPLETADA
    // ─────────────────────────────────────

    await this.supabaseService.supabase
      .from('evaluaciones')
      .upsert(
        [
          {
            finca_id: fincaId,
            tipo: 'salud'
          }
        ],
        {
          onConflict: 'finca_id,tipo'
        }
      );

    this.guardadoExitoso = true;

    alert(
      'Evaluación de salud guardada correctamente ✓'
    );

    this.router.navigate([
      '/evaluaciones/final'
    ]);

  }

  // ─────────────────────────────────────────
  // OPCIONES
  // ─────────────────────────────────────────

  torsion = [
    {
      nombre: 'Ningún animal presenta torsión',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Hasta el 4% moderada y ninguno severa',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Hasta el 4% moderada o 2% severa',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 4% moderada o 2% severa',
      puntaje: 0,
      active: false
    }
  ];

  suciedad = [
    {
      nombre: 'Ningún animal sucio',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Hasta 4% moderada y ninguno severa',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Hasta 4% moderada y 2% severa',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 4% moderada o 2% severa',
      puntaje: 0,
      active: false
    }
  ];

  respiratorio = [
    {
      nombre: 'Menos del 3%',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 4% y 7%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 8% y 10%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 10%',
      puntaje: 0,
      active: false
    }
  ];

  ojos = [
    {
      nombre: 'Menos del 3%',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 4% y 7%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 8% y 10%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 10%',
      puntaje: 0,
      active: false
    }
  ];

  lesiones = [
    {
      nombre: 'Menos del 3%',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 4% y 7%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 8% y 10%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 10%',
      puntaje: 0,
      active: false
    }
  ];

  condicion = [
    {
      nombre: 'Más del 85% ideal',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 65% y 85%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 45% y 65%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Menos del 45%',
      puntaje: 0,
      active: false
    }
  ];

  enteropatia = [
    {
      nombre: 'Ningún animal',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Menos del 1%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 1% y 2%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 2%',
      puntaje: 0,
      active: false
    }
  ];

  pododermatitis = [
    {
      nombre: '30% moderada y ninguna severa',
      puntaje: 100,
      active: false
    },
    {
      nombre: '50% moderada o 5% severa',
      puntaje: 55,
      active: false
    },
    {
      nombre: '65% moderada o 8% severa',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más de 65% o más de 8%',
      puntaje: 0,
      active: false
    }
  ];

  diarrea = [
    {
      nombre: 'Menos del 3%',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 3% y 4%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 4% y 5%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 5%',
      puntaje: 0,
      active: false
    }
  ];

  mastitis = [
    {
      nombre: 'Ninguna hembra',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Menos del 3%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 3% y 5%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 5%',
      puntaje: 0,
      active: false
    }
  ];

  piel = [
    {
      nombre: 'Menos del 3%',
      puntaje: 100,
      active: false
    },
    {
      nombre: 'Entre 3% y 4%',
      puntaje: 55,
      active: false
    },
    {
      nombre: 'Entre 4% y 5%',
      puntaje: 20,
      active: false
    },
    {
      nombre: 'Más del 5%',
      puntaje: 0,
      active: false
    }
  ];

}