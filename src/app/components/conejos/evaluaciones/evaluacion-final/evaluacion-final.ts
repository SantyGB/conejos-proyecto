import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-evaluacion-final',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './evaluacion-final.html',
  styleUrls: ['./evaluacion-final.scss']
})
export class EvaluacionFinalComponent
implements OnInit {

  nombreFinca: string = '';

  fincaId: string = '';

  // progreso
  totalEvaluaciones = 6;
  evaluacionesCompletadas = 0;
  porcentajeProgreso = 0;

  // puntajes individuales
  puntajeAlimentacion = 0;
  puntajeInstalaciones = 0;
  puntajeObservacion = 0;
  puntajeSalud = 0;
  puntajeGestion = 0;
  puntajeCapacitacion = 0;

  // grupos ICA
  puntajeMBR = 0;
  puntajeMBA = 0;
  puntajeMBG = 0;

  // final
  resultadoTotal = 0;
  clasificacionFinal = '';
  mensajeFinal = '';

colorClasificacion = '';

resumenes: any[] = [];

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    this.fincaId =
      localStorage.getItem('finca_id') || '';

    this.nombreFinca =
      localStorage.getItem('finca_nombre') || 'Sin finca';

    if (!this.fincaId) return;

    await this.cargarDatos();

  }

  async cargarDatos(): Promise<void> {

    // ─────────────────────────────
    // ALIMENTACION
    // ─────────────────────────────

    const { data: alimentacion } =
      await this.supabase.supabase
        .from('alimentacion')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (alimentacion) {

      this.puntajeAlimentacion =
        Number(alimentacion.subtotal || 0);

      this.evaluacionesCompletadas++;

    }

    // ─────────────────────────────
    // INSTALACIONES
    // ─────────────────────────────

    const { data: instalaciones } =
      await this.supabase.supabase
        .from('instalaciones')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (instalaciones) {

      this.puntajeInstalaciones =
        Number(instalaciones.puntaje_total || 0);

      this.evaluacionesCompletadas++;

    }

    // ─────────────────────────────
    // OBSERVACION
    // ─────────────────────────────

    const { data: observacion } =
      await this.supabase.supabase
        .from('observacion_animal')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (observacion) {

      this.puntajeObservacion =
  Number(observacion.puntaje_total || 0);

      this.evaluacionesCompletadas++;

    }

    // ─────────────────────────────
    // SALUD
    // ─────────────────────────────

    const { data: salud } =
      await this.supabase.supabase
        .from('salud')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (salud) {

      const rawSalud = Number(salud.subtotal || 0);

      this.puntajeSalud =
        rawSalud <= 100
          ? rawSalud
          : Math.round(rawSalud / 11);

      this.evaluacionesCompletadas++;

    }

    // ─────────────────────────────
    // GESTION
    // ─────────────────────────────

    const { data: gestion } =
      await this.supabase.supabase
        .from('gestion')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (gestion) {

      // promedio manual

      const valores = [

  Number(gestion.mortalidad_gazapos_puntaje || 0),
  Number(gestion.mortalidad_engorde_puntaje || 0),
  Number(gestion.mortalidad_reproductores_puntaje || 0),
  Number(gestion.manejo_predio_puntaje || 0),
  Number(gestion.plan_sanitario_puntaje || 0),
  Number(gestion.medicamentos_legales_puntaje || 0),
  Number(gestion.contingencia_desastres_puntaje || 0)

];

const suma =
  valores.reduce((a, b) => a + b, 0);

this.puntajeGestion =
  Math.round(suma / valores.length);

console.log('GESTION', gestion);
console.log('VALORES GESTION', valores);
console.log('PUNTAJE GESTION', this.puntajeGestion);

    }

    // ─────────────────────────────
    // CAPACITACION
    // ─────────────────────────────

    const { data: capacitacion } =
      await this.supabase.supabase
        .from('capacitacion')
        .select('*')
        .eq('finca_id', this.fincaId)
        .order('id', { ascending: false })
        .limit(1)
        .single();

    if (capacitacion) {

      const valores = [

  Number(capacitacion.personal_capacitado_puntaje || 0),
  Number(capacitacion.protocolo_sacrificio_puntaje || 0),
  Number(capacitacion.protocolo_eutanasia_puntaje || 0)

];

const suma =
  valores.reduce((a, b) => a + b, 0);

this.puntajeCapacitacion =
  Math.round(suma / valores.length);

this.evaluacionesCompletadas++;

console.log('CAPACITACION', capacitacion);
console.log('VALORES CAP', valores);
console.log('PUNTAJE CAP', this.puntajeCapacitacion);

    }

    // ─────────────────────────────
    // PROGRESO
    // ─────────────────────────────

    this.porcentajeProgreso =
      Math.round(
        (
          this.evaluacionesCompletadas
          /
          this.totalEvaluaciones
        ) * 100
      );

    // ─────────────────────────────
    // ICA
    // ─────────────────────────────

    // MBR = Alimentacion + Instalaciones
    this.puntajeMBR =
      (
        this.puntajeAlimentacion
        +
        this.puntajeInstalaciones
      ) / 2;

    // MBA = Observacion + Salud
    this.puntajeMBA =
      (
        this.puntajeObservacion
        +
        this.puntajeSalud
      ) / 2;

    // MBG = Gestion + Capacitacion
    this.puntajeMBG =
      (
        this.puntajeGestion
        +
        this.puntajeCapacitacion
      ) / 2;

    // ─────────────────────────────
    // FORMULA FINAL ICA
    // ─────────────────────────────

    this.resultadoTotal = Math.round(

      (
        this.puntajeMBR * 0.30
      )
      +
      (
        this.puntajeMBA * 0.60
      )
      +
      (
        this.puntajeMBG * 0.10
      )

    );

    // ─────────────────────────────
    // CLASIFICACION
    // ─────────────────────────────

    if (this.resultadoTotal >= 90) {

      this.clasificacionFinal =
        '🏆 Excelente Bienestar';

    }

    else if (this.resultadoTotal >= 75) {

      this.clasificacionFinal =
        '✅ Alto Bienestar';

    }

    else if (this.resultadoTotal >= 50) {

      this.clasificacionFinal =
        '⚠️ Medio Bienestar';

    }

    else {

      this.clasificacionFinal =
        '🚨 Bajo Bienestar';

    }
    // ─────────────────────────────
// MENSAJE FINAL
// ─────────────────────────────

if (this.resultadoTotal >= 90) {

  this.mensajeFinal =
    'La finca presenta excelentes condiciones de bienestar animal según criterios ICA.';

  this.colorClasificacion =
    'verde';

}

else if (this.resultadoTotal >= 75) {

  this.mensajeFinal =
    'La finca presenta buenas condiciones generales con oportunidades menores de mejora.';

  this.colorClasificacion =
    'azul';

}

else if (this.resultadoTotal >= 50) {

  this.mensajeFinal =
    'Existen afectaciones que podrían deteriorar el bienestar animal si no se corrigen.';

  this.colorClasificacion =
    'amarillo';

}

else {

  this.mensajeFinal =
    'La finca presenta deficiencias importantes que requieren intervención inmediata.';

  this.colorClasificacion =
    'rojo';

}

// ─────────────────────────────
// RESUMENES
// ─────────────────────────────

this.resumenes = [

  {
    titulo: 'Alimentación',
    descripcion:
      'Evaluación de alimento, agua y bebederos.',
    puntaje:
      Math.round(this.puntajeAlimentacion)
  },

  {
    titulo: 'Instalaciones',
    descripcion:
      'Evaluación de alojamiento y condiciones físicas.',
    puntaje:
      Math.round(this.puntajeInstalaciones)
  },

  {
    titulo: 'Observación',
    descripcion:
      'Comportamiento y estado observable de los animales.',
    puntaje:
      Math.round(this.puntajeObservacion)
  },

  {
    titulo: 'Salud',
    descripcion:
      'Estado sanitario y signos clínicos.',
    puntaje:
      Math.round(this.puntajeSalud)
  },

  {
    titulo: 'Gestión',
    descripcion:
      'Administración y manejo del predio.',
    puntaje:
      Math.round(this.puntajeGestion)
  },

  {
    titulo: 'Capacitación',
    descripcion:
      'Formación del personal y protocolos.',
    puntaje:
      Math.round(this.puntajeCapacitacion)
  }

];

  }
  
  

  finalizar(): void {

    alert(
      'Evaluación finalizada correctamente'
    );

    this.router.navigate([
      '/evaluaciones'
    ]);

  }
  getColor(puntaje: number): string {

  if (puntaje >= 90) {

    return 'verde';

  }

  if (puntaje >= 75) {

    return 'azul';

  }

  if (puntaje >= 50) {

    return 'amarillo';

  }

  return 'rojo';

}

}