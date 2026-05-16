import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alimentacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './alimentacion.html',
  styleUrls: ['./alimentacion.scss']
})
export class AlimentacionComponent implements OnInit {

  // ─── Finca seleccionada ───────────────────────────────────────────────────
  fincaNombre: string = '';
  fincaId: string = '';

  ngOnInit() {
    // Recuperar finca guardada en localStorage al seleccionar predio
    const finca = localStorage.getItem('finca_seleccionada');
    if (finca) {
      try {
        const parsed = JSON.parse(finca);
        this.fincaNombre = parsed.nombre || parsed.name || '';
        this.fincaId     = parsed.id || '';
      } catch {
        this.fincaNombre = finca;
      }
    }
  }

  // ─── Respuestas ──────────────────────────────────────────────────────────
  respuestas: Record<string, number> = {};
  observaciones = '';

  // ─── Lista de todas las preguntas (para contador total) ──────────────────
  preguntas = [
    'comederos_limpios', 'comederos_mantenimiento', 'acceso_alimento',
    'alimento_ica', 'almacenamiento',
    'oferta_forraje',
    'leche_materna', 'alimento_solido',
    'suficientes_bebederos', 'agua_voluntad', 'acceso_agua',
    'calidad_agua', 'estado_bebederos', 'altura_bebederos'
  ];

  // ─── Bloques para las barras de progreso ─────────────────────────────────
  bloques = [
    {
      nombre: 'Comederos',
      icono: 'restaurant',
      color: '#2563eb',
      keys: ['comederos_limpios', 'comederos_mantenimiento', 'acceso_alimento']
    },
    {
      nombre: 'Alimento Balanceado',
      icono: 'verified',
      color: '#0d9488',
      keys: ['alimento_ica', 'almacenamiento']
    },
    {
      nombre: 'Forraje',
      icono: 'grass',
      color: '#16a34a',
      keys: ['oferta_forraje']
    },
    {
      nombre: 'Gazapos',
      icono: 'pets',
      color: '#7c3aed',
      keys: ['leche_materna', 'alimento_solido']
    },
    {
      nombre: 'Agua y Bebederos',
      icono: 'water_drop',
      color: '#1d4ed8',
      keys: ['suficientes_bebederos', 'agua_voluntad', 'acceso_agua',
             'calidad_agua', 'estado_bebederos', 'altura_bebederos']
    }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  //  OPCIONES POR INDICADOR — fieles a la escala ICA (0 / 20 / 55 / 100)
  // ─────────────────────────────────────────────────────────────────────────

  /** 7.1.1 Estado y acceso a comederos */
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

  /** 7.1.2 Alimento balanceado — solo 3 niveles según norma */
  opcionesAlimentoBalanceado = [
    {
      valor: 100,
      texto: 'Se cumplen las dos condiciones',
      criterio: 'Registro ICA vigente Y almacenamiento adecuado'
    },
    {
      valor: 55,
      texto: 'Solo se cumple una condición',
      criterio: 'Registro ICA O almacenamiento adecuado, pero no ambos'
    },
    {
      valor: 0,
      texto: 'No se cumple ninguna condición',
      criterio: 'Sin registro ICA ni almacenamiento adecuado'
    }
  ];

  /** 7.1.3 Acceso a forraje — solo 3 niveles */
  opcionesForraje = [
    {
      valor: 100,
      texto: 'Existe oferta en pasteras o comederos',
      criterio: 'Forraje disponible con comedero o pastera apropiados'
    },
    {
      valor: 55,
      texto: 'Existe oferta pero sin comederos',
      criterio: 'Hay forraje disponible pero no cuenta con pasteras o comederos'
    },
    {
      valor: 0,
      texto: 'No existe oferta de forraje',
      criterio: 'Los animales no tienen acceso a forraje'
    }
  ];

  /** 7.1.4 Acceso a alimento en gazapos — solo 2 niveles */
  opcionesGazapos = [
    {
      valor: 100,
      texto: 'Se garantiza y controla el acceso',
      criterio: 'Leche materna mínimo 30 días + alimento sólido desde los 16 días'
    },
    {
      valor: 0,
      texto: 'No se garantiza el acceso',
      criterio: 'Sin acceso a leche materna ni a alimento sólido desde los 21 días'
    }
  ];

  /** 7.1.5 Acceso y disponibilidad al agua de bebida */
  opcionesAgua = [
    {
      valor: 100,
      texto: 'Todos los bebederos cumplen',
      criterio: 'Llenos o con flujo, cantidad adecuada, agua limpia y de buena calidad'
    },
    {
      valor: 55,
      texto: 'Más del 80% cumplen',
      criterio: 'Más del 80% con flujo, cantidad adecuada y agua de buena calidad'
    },
    {
      valor: 20,
      texto: 'Entre el 50% y 80% cumplen',
      criterio: 'Entre 50% y 80% con flujo, cantidad adecuada y agua de buena calidad'
    },
    {
      valor: 0,
      texto: 'Los animales no tienen acceso a agua limpia',
      criterio: 'Menos del 50% o agua de mala calidad'
    }
  ];

  /** 7.1.6 Estado de bebederos o chupos */
  opcionesEstadoBebederos = [
    {
      valor: 100,
      texto: 'Todos en buen estado',
      criterio: '100% en buen funcionamiento, conservación y aseo'
    },
    {
      valor: 55,
      texto: 'Más del 80% en buen estado',
      criterio: 'Más del 80% en buen funcionamiento, conservación y aseo'
    },
    {
      valor: 20,
      texto: 'Entre el 70% y 80% en buen estado',
      criterio: 'Entre 70% y 80% en buen funcionamiento, conservación y aseo'
    },
    {
      valor: 0,
      texto: 'Menos del 70% en buen estado',
      criterio: 'Menos del 70% en buen funcionamiento, conservación y aseo'
    }
  ];

  /** 7.1.7 Altura de bebederos o chupos */
  opcionesAlturaBebederos = [
    {
      valor: 100,
      texto: 'Todos a altura apropiada',
      criterio: 'Adultos: 16–20 cm. Gazapos: altura recomendada (< 14 cm)'
    },
    {
      valor: 55,
      texto: 'Más del 80% a altura apropiada',
      criterio: 'Adultos: >80% correctos. Gazapos: altura aceptable (14–22 cm)'
    },
    {
      valor: 20,
      texto: 'Entre el 70% y 80% a altura apropiada',
      criterio: 'Adultos: 70–80% correctos. Gazapos: altura aceptable'
    },
    {
      valor: 0,
      texto: 'Menos del 70% a altura apropiada',
      criterio: 'Adultos: <70% correctos. Gazapos: por encima de altura aceptable'
    }
  ];

  // ─── Métodos ─────────────────────────────────────────────────────────────

  seleccionar(key: string, valor: number) {
    this.respuestas = { ...this.respuestas, [key]: valor };
  }

  calcularSubtotal(): number {
    const valores = Object.values(this.respuestas);
    if (!valores.length) return 0;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }

  getPromedioBloque(keys: string[]): number {
    const vals = keys
      .filter(k => this.respuestas[k] !== undefined)
      .map(k => this.respuestas[k]);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  getRespondidas(keys: string[]): number {
    return keys.filter(k => this.respuestas[k] !== undefined).length;
  }

  getTotalRespondidas(): number {
    return this.preguntas.filter(k => this.respuestas[k] !== undefined).length;
  }

  // ─── Gauge SVG ───────────────────────────────────────────────────────────
  // Circunferencia del radio 64: 2π × 64 ≈ 402.12
  private readonly CIRCUNFERENCIA = 402.12;

  getGaugeOffset(): number {
    const pct = this.calcularSubtotal() / 100;
    return this.CIRCUNFERENCIA * (1 - pct);
  }

  getGaugeColor(): string {
    const val = this.calcularSubtotal();
    if (val >= 90) return '#16a34a';
    if (val >= 75) return '#2563eb';
    if (val >= 50) return '#d97706';
    if (val > 0)   return '#dc2626';
    return '#cbd5e1';
  }

  getColorBloque(keys: string[]): string {
    const val = this.getPromedioBloque(keys);
    if (val >= 90) return '#16a34a';
    if (val >= 75) return '#2563eb';
    if (val >= 50) return '#d97706';
    if (val > 0)   return '#dc2626';
    return '#94a3b8';
  }

  getNivelTexto(): string {
    const val = this.calcularSubtotal();
    if (val === 0 && !Object.keys(this.respuestas).length) return 'Sin respuestas';
    if (val >= 90) return 'Excelente Bienestar';
    if (val >= 75) return 'Alto Bienestar';
    if (val >= 50) return 'Bienestar Medio';
    return 'Bienestar Bajo';
  }
}