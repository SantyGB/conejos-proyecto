import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.html',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ['./resultados.scss']
})
export class ResultadosComponent implements OnInit {

  // ─── KPIs ──────────────────────────────────────────────────
  totalGranjas       = 0;
  promedioGeneral    = 0;
  granjasExcelentes  = 0;
  granjasEnProceso   = 0;

  // ─── TABLA ─────────────────────────────────────────────────
  resultados: any[] = [];

  // ─── ESTADO ────────────────────────────────────────────────
  cargando           = true;
  generandoInforme: string | null = null;

  constructor(private supabase: SupabaseService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarResultados();
  }

  async cargarResultados(): Promise<void> {
    this.cargando = true;

    // Query 1: fincas
    const { data: fincas, error } = await this.supabase.supabase
      .from('fincas')
      .select(`
        id, nombre_finca, propietario, ubicacion,
        tipo_productor, total_conejos, fecha_visita, tecnico
      `)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error cargando fincas:', error);
      this.cargando = false;
      return;
    }

    // Query 2: evaluaciones finales
    const { data: evaluaciones } = await this.supabase.supabase
      .from('evaluacion_final')
      .select('*');

    // Query 3: secciones completadas
    const { data: secciones } = await this.supabase.supabase
      .from('evaluaciones')
      .select('finca_id, tipo');

    // Mapear por finca_id
    const evalMap: Record<string, any> = {};
    for (const ev of evaluaciones || []) {
      evalMap[ev.finca_id] = ev;
    }

    const seccionesMap: Record<string, number> = {};
    for (const s of secciones || []) {
      seccionesMap[s.finca_id] = (seccionesMap[s.finca_id] || 0) + 1;
    }

    this.resultados = (fincas || []).map((finca: any) => {
      const ef = evalMap[finca.id] || null;
      return {
        ...finca,
        resultado_total:       ef?.resultado_total       || 0,
        clasificacion_final:   ef?.clasificacion_final   || 'Sin evaluar',
        puntaje_mbr:           ef?.puntaje_mbr           || 0,
        puntaje_mba:           ef?.puntaje_mba           || 0,
        puntaje_mbg:           ef?.puntaje_mbg           || 0,
        puntaje_alimentacion:  ef?.puntaje_alimentacion  || 0,
        puntaje_instalaciones: ef?.puntaje_instalaciones || 0,
        puntaje_observacion:   ef?.puntaje_observacion   || 0,
        puntaje_salud:         ef?.puntaje_salud         || 0,
        puntaje_gestion:       ef?.puntaje_gestion       || 0,
        puntaje_capacitacion:  ef?.puntaje_capacitacion  || 0,
        ultima_evaluacion:     ef?.created_at            || finca.fecha_visita || null,
        secciones_completadas: seccionesMap[finca.id]    || 0,
        total_secciones:       8,
        tiene_resultado:       !!ef
      };
    });

    // KPIs
    this.totalGranjas = this.resultados.length;

    const conResultado = this.resultados.filter(r => r.tiene_resultado);

    this.promedioGeneral = conResultado.length
      ? Math.round(
          conResultado.reduce((acc, r) => acc + r.resultado_total, 0) /
          conResultado.length
        )
      : 0;

    this.granjasExcelentes = this.resultados.filter(
      r => r.resultado_total >= 75
    ).length;

    this.granjasEnProceso = this.resultados.filter(
      r => r.secciones_completadas > 0 && !r.tiene_resultado
    ).length;

    this.cargando = false;
  }

  // ─── HELPERS ───────────────────────────────────────────────

  getEstadoLabel(r: any): string {
    if (!r.tiene_resultado && r.secciones_completadas === 0) return 'Sin iniciar';
    if (!r.tiene_resultado) return 'En proceso';
    if (r.resultado_total >= 90) return 'Excelente';
    if (r.resultado_total >= 75) return 'Alto';
    if (r.resultado_total >= 50) return 'Medio';
    return 'Crítico';
  }

  getEstadoClass(r: any): string {
    if (!r.tiene_resultado && r.secciones_completadas === 0) return 'sin-iniciar';
    if (!r.tiene_resultado) return 'medio';
    if (r.resultado_total >= 90) return 'excelente';
    if (r.resultado_total >= 75) return 'excelente';
    if (r.resultado_total >= 50) return 'medio';
    return 'critico';
  }

  getScoreClass(puntaje: number): string {
    if (puntaje >= 75) return 'score-green';
    if (puntaje >= 50) return 'score-yellow';
    return 'score-red';
  }

  getBarClass(val: number): string {
    if (val >= 75) return 'bar-fill-green';
    if (val >= 50) return 'bar-fill-yellow';
    return 'bar-fill-red';
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  getPorcentajeSecciones(r: any): number {
    return Math.round((r.secciones_completadas / r.total_secciones) * 100);
  }

  // ─── GENERAR INFORME PDF ────────────────────────────────────

  async generarInforme(r: any): Promise<void> {
    this.generandoInforme = r.id;

    try {
      // Cargar datos completos de la finca
      const { data: finca } = await this.supabase.supabase
        .from('fincas').select('*').eq('id', r.id).single();

      const { data: alimentacion } = await this.supabase.supabase
        .from('alimentacion').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const { data: instalaciones } = await this.supabase.supabase
        .from('instalaciones').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const { data: observacion } = await this.supabase.supabase
        .from('observacion_animal').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const { data: salud } = await this.supabase.supabase
        .from('salud').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const { data: gestion } = await this.supabase.supabase
        .from('gestion').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const { data: capacitacion } = await this.supabase.supabase
        .from('capacitacion').select('*').eq('finca_id', r.id)
        .order('id', { ascending: false }).limit(1).single();

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W      = 210;
      const margin = 20;
      let y        = 0;

      const colorPrimario: [number, number, number] = [15, 61, 145];
      const colorAcento:   [number, number, number] = [37, 99, 235];
      const colorTexto:    [number, number, number] = [15, 23, 42];
      const colorSuave:    [number, number, number] = [100, 116, 139];
      const colorFondo:    [number, number, number] = [241, 245, 249];
      const colorBorde:    [number, number, number] = [226, 232, 240];

      const getColorPuntaje = (p: number): [number, number, number] => {
        if (p >= 75) return [22, 163, 74];
        if (p >= 50) return [217, 119, 6];
        return [220, 38, 38];
      };

      // ── PORTADA ────────────────────────────────────────────
      doc.setFillColor(...colorPrimario);
      doc.rect(0, 0, W, 80, 'F');

      doc.setFillColor(...colorAcento);
      doc.rect(0, 60, W, 25, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('SISTEMA DE EVALUACIÓN DE BIENESTAR ANIMAL', margin, 22);
      doc.text('CUNICULTURA — ICA COLOMBIA', margin, 30);

      doc.setFontSize(26);
      doc.text('Informe de Evaluación', margin, 48);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Diagnóstico consolidado de bienestar animal', margin, 56);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(r.nombre_finca.toUpperCase(), margin, 71);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}`,
        margin, 78
      );

      y = 95;

      // ── DATOS DE LA FINCA ──────────────────────────────────
      doc.setFillColor(...colorFondo);
      doc.roundedRect(margin, y, W - margin * 2, 52, 4, 4, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colorPrimario);
      doc.text('INFORMACIÓN DE LA FINCA', margin + 6, y + 10);

      doc.setDrawColor(...colorAcento);
      doc.setLineWidth(0.5);
      doc.line(margin + 6, y + 12, W - margin - 6, y + 12);

      const datos = [
        ['Nombre:',            finca?.nombre_finca    || r.nombre_finca],
        ['Propietario:',       finca?.propietario     || '—'],
        ['Ubicación:',         finca?.ubicacion       || r.ubicacion],
        ['Técnico evaluador:', finca?.tecnico         || r.tecnico || '—'],
        ['Tipo de productor:', finca?.tipo_productor  || '—'],
        ['Total conejos:',     String(finca?.total_conejos || 0)],
      ];

      let dy = y + 20;
      datos.forEach(([label, val], i) => {
        const col = i % 2 === 0 ? margin + 6 : W / 2 + 4;
        if (i % 2 === 0 && i > 0) dy += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...colorSuave);
        doc.text(label, col, dy);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorTexto);
        doc.text(val, col + 30, dy);
      });

      y += 62;

      // ── RESULTADO ICA ──────────────────────────────────────
      doc.setFillColor(...getColorPuntaje(r.resultado_total));
      doc.roundedRect(margin, y, W - margin * 2, 36, 4, 4, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(`${r.resultado_total}%`, margin + 10, y + 22);

      doc.setFontSize(13);
      doc.text('Resultado Final ICA', margin + 38, y + 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(r.clasificacion_final.replace(/[🏆✅⚠️🚨]/g, '').trim(), margin + 38, y + 23);

      doc.setFontSize(9);
      doc.text(
        `(${r.puntaje_mbr} × 0.30) + (${r.puntaje_mba} × 0.60) + (${r.puntaje_mbg} × 0.10) = ${r.resultado_total}%`,
        margin + 38, y + 31
      );

      y += 46;

      // ── GRUPOS ICA ─────────────────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colorPrimario);
      doc.text('PUNTAJES POR GRUPO ICA', margin, y + 8);
      doc.setDrawColor(...colorBorde);
      doc.setLineWidth(0.3);
      doc.line(margin, y + 10, W - margin, y + 10);
      y += 14;

      const grupos = [
        { tag: 'MBR', nombre: 'Medidas Buen Recurso',   val: r.puntaje_mbr, peso: '30%' },
        { tag: 'MBA', nombre: 'Medidas Buen Animal',     val: r.puntaje_mba, peso: '60%' },
        { tag: 'MBG', nombre: 'Medidas Buen Ganadero',  val: r.puntaje_mbg, peso: '10%' },
      ];

      const gw = (W - margin * 2 - 8) / 3;
      grupos.forEach((g, i) => {
        const gx = margin + i * (gw + 4);
        doc.setFillColor(...colorFondo);
        doc.roundedRect(gx, y, gw, 32, 3, 3, 'F');
        doc.setFillColor(...getColorPuntaje(g.val));
        doc.roundedRect(gx, y, gw, 8, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`${g.tag} — Peso: ${g.peso}`, gx + 4, y + 5.5);
        doc.setTextColor(...colorTexto);
        doc.setFontSize(20);
        doc.text(`${g.val}%`, gx + 4, y + 22);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colorSuave);
        doc.text(g.nombre, gx + 4, y + 29);
      });

      y += 42;

      // ── PUNTAJES INDIVIDUALES ──────────────────────────────
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colorPrimario);
      doc.text('DETALLE POR DIMENSIÓN', margin, y + 8);
      doc.setDrawColor(...colorBorde);
      doc.line(margin, y + 10, W - margin, y + 10);
      y += 16;

      const dims = [
        { label: 'Alimentación',  val: r.puntaje_alimentacion,  grupo: 'MBR' },
        { label: 'Instalaciones', val: r.puntaje_instalaciones, grupo: 'MBR' },
        { label: 'Observación',   val: r.puntaje_observacion,   grupo: 'MBA' },
        { label: 'Salud',         val: r.puntaje_salud,         grupo: 'MBA' },
        { label: 'Gestión',       val: r.puntaje_gestion,       grupo: 'MBG' },
        { label: 'Capacitación',  val: r.puntaje_capacitacion,  grupo: 'MBG' },
      ];

      dims.forEach((d) => {
        const bx    = margin;
        const bw    = W - margin * 2;
        const fillW = (bw - 80) * (d.val / 100);

        doc.setFillColor(...colorFondo);
        doc.roundedRect(bx, y, bw, 12, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...colorTexto);
        doc.text(d.label, bx + 4, y + 8);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colorSuave);
        doc.text(d.grupo, bx + 40, y + 8);

        doc.setFillColor(...colorBorde);
        doc.roundedRect(bx + 55, y + 3, bw - 80, 6, 2, 2, 'F');
        doc.setFillColor(...getColorPuntaje(d.val));
        doc.roundedRect(bx + 55, y + 3, fillW, 6, 2, 2, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...getColorPuntaje(d.val));
        doc.text(`${d.val}%`, bx + bw - 18, y + 8);

        y += 15;
      });

      y += 4;

      // ── NUEVA PÁGINA — ANÁLISIS DETALLADO ─────────────────
      doc.addPage();
      y = 20;

      doc.setFillColor(...colorPrimario);
      doc.rect(0, 0, W, 16, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`INFORME DETALLADO — ${r.nombre_finca.toUpperCase()}`, margin, 11);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, W - margin - 35, 11);

      y = 28;

      // Helper sección
      const seccion = (titulo: string, datos: { label: string; val: any }[]) => {
        doc.setFillColor(...colorAcento);
        doc.roundedRect(margin, y, W - margin * 2, 9, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(titulo, margin + 4, y + 6.5);
        y += 13;

        datos.forEach((item, i) => {
          if (y > 265) { doc.addPage(); y = 20; }
          const col = i % 2 === 0 ? margin : W / 2 + 2;
          if (i % 2 === 0 && i > 0) y += 8;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...colorSuave);
          doc.text(item.label + ':', col, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colorTexto);
          const valStr = item.val !== null && item.val !== undefined ? String(item.val) : '—';
          doc.text(valStr, col + 42, y);
        });
        y += 12;
      };

      if (alimentacion) {
        seccion('ALIMENTACIÓN', [
          { label: 'Comederos limpios',     val: `${alimentacion.comederos_limpios}%` },
          { label: 'Acceso al alimento',    val: `${alimentacion.acceso_alimento}%` },
          { label: 'Alimento ICA',          val: `${alimentacion.alimento_ica}%` },
          { label: 'Almacenamiento',        val: `${alimentacion.almacenamiento}%` },
          { label: 'Suficientes bebederos', val: `${alimentacion.suficientes_bebederos}%` },
          { label: 'Calidad del agua',      val: `${alimentacion.calidad_agua}%` },
          { label: 'Estado bebederos',      val: `${alimentacion.estado_bebederos}%` },
          { label: 'Puntaje total',         val: `${alimentacion.subtotal}%` },
        ]);
      }

      if (instalaciones) {
        seccion('INSTALACIONES', [
          { label: 'Alojamiento',   val: instalaciones.alojamiento_respuesta || '—' },
          { label: 'Espacio',       val: instalaciones.espacio_respuesta     || '—' },
          { label: 'Ventilación',   val: instalaciones.ventilacion_respuesta || '—' },
          { label: 'Iluminación',   val: instalaciones.iluminacion_respuesta || '—' },
          { label: 'Protección',    val: instalaciones.proteccion_respuesta  || '—' },
          { label: 'Puntaje total', val: `${instalaciones.puntaje_total}%` },
        ]);
      }

      if (observacion) {
        seccion('OBSERVACIÓN ANIMAL', [
          { label: 'Comportamientos',    val: observacion.comportamientos_respuesta || '—' },
          { label: 'Animales estirados', val: observacion.estirados_respuesta       || '—' },
          { label: 'Estrés',             val: observacion.estres_respuesta          || '—' },
          { label: 'Animales mojados',   val: observacion.mojados_respuesta         || '—' },
          { label: 'Animales aislados',  val: observacion.aislados_respuesta        || '—' },
          { label: 'Puntaje total',      val: `${observacion.puntaje_total}%` },
        ]);
      }

      if (salud) {
        seccion('SALUD', [
          { label: 'Condición corporal',  val: salud.condicion_corporal        || '—' },
          { label: 'Lesiones',            val: salud.lesiones                  || '—' },
          { label: 'Prob. respiratorios', val: salud.problemas_respiratorios   || '—' },
          { label: 'Diarrea',             val: salud.diarrea                   || '—' },
          { label: 'Piel',                val: salud.piel                      || '—' },
          { label: 'Puntaje total',       val: `${salud.subtotal}%` },
        ]);
      }

      if (gestion) {
        seccion('GESTIÓN', [
          { label: 'Mortalidad gazapos',     val: `${gestion.mortalidad_gazapos_puntaje}%` },
          { label: 'Mortalidad engorde',     val: `${gestion.mortalidad_engorde_puntaje}%` },
          { label: 'Plan sanitario',         val: `${gestion.plan_sanitario_puntaje}%` },
          { label: 'Medicamentos legales',   val: `${gestion.medicamentos_legales_puntaje}%` },
          { label: 'Contingencia desastres', val: `${gestion.contingencia_desastres_puntaje}%` },
          { label: 'Manejo del predio',      val: `${gestion.manejo_predio_puntaje}%` },
        ]);
      }

      if (capacitacion) {
        seccion('CAPACITACIÓN', [
          { label: 'Personal capacitado',  val: `${capacitacion.personal_capacitado_puntaje}%` },
          { label: 'Protocolo sacrificio', val: `${capacitacion.protocolo_sacrificio_puntaje}%` },
          { label: 'Protocolo eutanasia',  val: `${capacitacion.protocolo_eutanasia_puntaje}%` },
        ]);
      }

      // Imagen de la finca
      if (finca?.imagen_url) {
        try {
          if (y > 220) { doc.addPage(); y = 20; }
          doc.setFillColor(...colorAcento);
          doc.roundedRect(margin, y, W - margin * 2, 9, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('FOTOGRAFÍA DE LA FINCA', margin + 4, y + 6.5);
          y += 13;

          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            img.onload = () => {
              doc.addImage(img, 'JPEG', margin, y, W - margin * 2, 60);
              y += 66;
              resolve();
            };
            img.onerror = () => resolve();
            img.src = finca.imagen_url;
          });
        } catch (e) { /* sin imagen */ }
      }

      // ── PIE DE PÁGINA ──────────────────────────────────────
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFillColor(...colorFondo);
        doc.rect(0, 285, W, 12, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colorSuave);
        doc.text('Sistema de Bienestar Animal — Cunicultura ICA Colombia', margin, 292);
        doc.text(`Página ${p} de ${totalPages}`, W - margin - 20, 292);
      }

      doc.save(
        `informe-${r.nombre_finca.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`
      );

    } catch (err) {
      console.error('Error generando informe:', err);
      alert('Error al generar el informe. Revisa la consola.');
    } finally {
      this.generandoInforme = null;
    }
  }
}