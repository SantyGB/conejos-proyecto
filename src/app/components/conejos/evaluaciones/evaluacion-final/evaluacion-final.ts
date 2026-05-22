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
export class EvaluacionFinalComponent implements OnInit {

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

  // estado guardado
  yaGuardado = false;
  guardando = false;
  errorGuardar = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.fincaId   = localStorage.getItem('finca_id')    || '';
    this.nombreFinca = localStorage.getItem('finca_nombre') || 'Sin finca';

    if (!this.fincaId) return;

    await this.cargarDatos();
  }

  // ─────────────────────────────────────────────────────────────
  // CARGA DE DATOS DESDE SUPABASE
  // ─────────────────────────────────────────────────────────────

  async cargarDatos(): Promise<void> {

    // ALIMENTACION
    const { data: alimentacion } = await this.supabase.supabase
      .from('alimentacion')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (alimentacion) {
      this.puntajeAlimentacion = Number(alimentacion.subtotal || 0);
      this.evaluacionesCompletadas++;
    }

    // INSTALACIONES
    const { data: instalaciones } = await this.supabase.supabase
      .from('instalaciones')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (instalaciones) {
      this.puntajeInstalaciones = Number(instalaciones.puntaje_total || 0);
      this.evaluacionesCompletadas++;
    }

    // OBSERVACION
    const { data: observacion } = await this.supabase.supabase
      .from('observacion_animal')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (observacion) {
      this.puntajeObservacion = Number(observacion.puntaje_total || 0);
      this.evaluacionesCompletadas++;
    }

    // SALUD
    const { data: salud } = await this.supabase.supabase
      .from('salud')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (salud) {
      const rawSalud = Number(salud.subtotal || 0);
      this.puntajeSalud = rawSalud <= 100 ? rawSalud : Math.round(rawSalud / 11);
      this.evaluacionesCompletadas++;
    }

    // GESTION
    const { data: gestion } = await this.supabase.supabase
      .from('gestion')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (gestion) {
      const valores = [
        Number(gestion.mortalidad_gazapos_puntaje     || 0),
        Number(gestion.mortalidad_engorde_puntaje     || 0),
        Number(gestion.mortalidad_reproductores_puntaje || 0),
        Number(gestion.manejo_predio_puntaje          || 0),
        Number(gestion.plan_sanitario_puntaje         || 0),
        Number(gestion.medicamentos_legales_puntaje   || 0),
        Number(gestion.contingencia_desastres_puntaje || 0)
      ];
      const suma = valores.reduce((a, b) => a + b, 0);
      this.puntajeGestion = Math.round(suma / valores.length);
      this.evaluacionesCompletadas++; // BUG CORREGIDO: faltaba este contador
    }

    // CAPACITACION
    const { data: capacitacion } = await this.supabase.supabase
      .from('capacitacion')
      .select('*')
      .eq('finca_id', this.fincaId)
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (capacitacion) {
      const valores = [
        Number(capacitacion.personal_capacitado_puntaje  || 0),
        Number(capacitacion.protocolo_sacrificio_puntaje || 0),
        Number(capacitacion.protocolo_eutanasia_puntaje  || 0)
      ];
      const suma = valores.reduce((a, b) => a + b, 0);
      this.puntajeCapacitacion = Math.round(suma / valores.length);
      this.evaluacionesCompletadas++;
    }

    // ─── PROGRESO ────────────────────────────────────────────
    this.porcentajeProgreso = Math.round(
      (this.evaluacionesCompletadas / this.totalEvaluaciones) * 100
    );

    // ─── GRUPOS ICA ──────────────────────────────────────────
    // MBR = Medidas del Buen Recurso (Alimentación + Instalaciones)
    this.puntajeMBR = Math.round(
      (this.puntajeAlimentacion + this.puntajeInstalaciones) / 2
    );

    // MBA = Medidas del Buen Animal (Observación + Salud)
    this.puntajeMBA = Math.round(
      (this.puntajeObservacion + this.puntajeSalud) / 2
    );

    // MBG = Medidas del Buen Ganadero (Gestión + Capacitación)
    this.puntajeMBG = Math.round(
      (this.puntajeGestion + this.puntajeCapacitacion) / 2
    );

    // ─── FORMULA FINAL ICA ───────────────────────────────────
    this.resultadoTotal = Math.round(
      (this.puntajeMBR * 0.30) +
      (this.puntajeMBA * 0.60) +
      (this.puntajeMBG * 0.10)
    );

    // ─── CLASIFICACION ───────────────────────────────────────
    if (this.resultadoTotal >= 90) {
      this.clasificacionFinal  = '🏆 Excelente Bienestar';
      this.mensajeFinal        = 'La finca presenta excelentes condiciones de bienestar animal según criterios ICA.';
      this.colorClasificacion  = 'verde';
    } else if (this.resultadoTotal >= 75) {
      this.clasificacionFinal  = '✅ Alto Bienestar';
      this.mensajeFinal        = 'La finca presenta buenas condiciones generales con oportunidades menores de mejora.';
      this.colorClasificacion  = 'azul';
    } else if (this.resultadoTotal >= 50) {
      this.clasificacionFinal  = '⚠️ Medio Bienestar';
      this.mensajeFinal        = 'Existen afectaciones que podrían deteriorar el bienestar animal si no se corrigen.';
      this.colorClasificacion  = 'amarillo';
    } else {
      this.clasificacionFinal  = '🚨 Bajo Bienestar';
      this.mensajeFinal        = 'La finca presenta deficiencias importantes que requieren intervención inmediata.';
      this.colorClasificacion  = 'rojo';
    }

    // ─── RESUMENES ───────────────────────────────────────────
    this.resumenes = [
      { titulo: 'Alimentación',  descripcion: 'Evaluación de alimento, agua y bebederos.',         puntaje: Math.round(this.puntajeAlimentacion)  },
      { titulo: 'Instalaciones', descripcion: 'Evaluación de alojamiento y condiciones físicas.',  puntaje: Math.round(this.puntajeInstalaciones) },
      { titulo: 'Observación',   descripcion: 'Comportamiento y estado observable de los animales.', puntaje: Math.round(this.puntajeObservacion) },
      { titulo: 'Salud',         descripcion: 'Estado sanitario y signos clínicos.',               puntaje: Math.round(this.puntajeSalud)         },
      { titulo: 'Gestión',       descripcion: 'Administración y manejo del predio.',               puntaje: Math.round(this.puntajeGestion)       },
      { titulo: 'Capacitación',  descripcion: 'Formación del personal y protocolos.',              puntaje: Math.round(this.puntajeCapacitacion)  }
    ];

    // ─── VERIFICAR SI YA EXISTE RESULTADO GUARDADO ───────────
    const { data: existente } = await this.supabase.supabase
      .from('evaluacion_final')
      .select('id')
      .eq('finca_id', this.fincaId)
      .limit(1)
      .single();

    this.yaGuardado = !!existente;
  }

  // ─────────────────────────────────────────────────────────────
  // GUARDAR EN SUPABASE (evaluacion_final)
  // ─────────────────────────────────────────────────────────────

  async guardarResultado(): Promise<void> {

      console.log('fincaId:', this.fincaId);
  console.log('evaluacionesCompletadas:', this.evaluacionesCompletadas);
  console.log('totalEvaluaciones:', this.totalEvaluaciones);
  console.log('resultadoTotal:', this.resultadoTotal);

    if (!this.fincaId) {
      this.errorGuardar = 'No hay finca seleccionada.';
      return;
    }

    if (this.evaluacionesCompletadas < this.totalEvaluaciones) {
      this.errorGuardar = `Faltan ${this.totalEvaluaciones - this.evaluacionesCompletadas} evaluación(es) por completar.`;
      return;
    }

    this.guardando    = true;
    this.errorGuardar = '';

    try {
      const payload = {
        finca_id:           this.fincaId,
        puntaje_mbr:        this.puntajeMBR,
        puntaje_mba:        this.puntajeMBA,
        puntaje_mbg:        this.puntajeMBG,
        resultado_total:    this.resultadoTotal,
        clasificacion_final: this.clasificacionFinal,

        // puntajes individuales
        puntaje_alimentacion:  this.puntajeAlimentacion,
        puntaje_instalaciones: this.puntajeInstalaciones,
        puntaje_observacion:   this.puntajeObservacion,
        puntaje_salud:         this.puntajeSalud,
        puntaje_gestion:       this.puntajeGestion,
        puntaje_capacitacion:  this.puntajeCapacitacion
      };

      // Verificar si ya existe
const { data: existentes } = await this.supabase.supabase
  .from('evaluacion_final')
  .select('id')
  .eq('finca_id', this.fincaId)
  .limit(1);

const existente = existentes?.[0] || null;
let error;

if (existente) {
  // Actualizar
  const { error: updateError } = await this.supabase.supabase
    .from('evaluacion_final')
    .update(payload)
    .eq('finca_id', this.fincaId);
  error = updateError;
} else {
  // Insertar
  const { error: insertError } = await this.supabase.supabase
    .from('evaluacion_final')
    .insert([payload]);
  error = insertError;
}

      if (error) {
        console.error('Error guardando evaluación final:', error);
        this.errorGuardar = 'Error al guardar. Revisa la consola.';
        return;
      }

      this.yaGuardado = true;
      alert('✅ Evaluación final guardada correctamente');
      this.router.navigate(['/resultados']);

    } catch (err) {
      console.error(err);
      this.errorGuardar = 'Ocurrió un error inesperado.';
    } finally {
      this.guardando = false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  getColor(puntaje: number): string {
    if (puntaje >= 90) return 'verde';
    if (puntaje >= 75) return 'azul';
    if (puntaje >= 50) return 'amarillo';
    return 'rojo';
  }

  /** Llamado por el botón "Finalizar evaluación" del HTML existente */
  finalizar(): void {
    this.guardarResultado();
  }
}