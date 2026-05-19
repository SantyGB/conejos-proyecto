import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

interface OpcionEval {
  nombre: string;
  active: boolean;
  puntaje?: number;
}

interface Finca {
  id: string;
  nombre_finca: string;
}

interface RespuestaDetalle {
  texto: string;
  puntaje: number;
}

interface Respuestas {
  alojamiento: RespuestaDetalle;
  reposa_patas: RespuestaDetalle;
  nidales: RespuestaDetalle;
  espacio: RespuestaDetalle;
  altura: RespuestaDetalle;
  iluminacion: RespuestaDetalle;
  ventilacion: RespuestaDetalle;
  proteccion: RespuestaDetalle;
}

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './instalaciones.html',
  styleUrls: ['./instalaciones.scss']
})
export class InstalacionesComponent implements OnInit {

  // ─── Estado general ────────────────────────────────────
  fincas: Finca[]        = [];
  fincaSeleccionada      = '';
  fincaNombre = '';
  observaciones          = '';
  guardando              = false;
  intentoGuardar         = false;
  isDragging             = false;

  // ─── Fotos ─────────────────────────────────────────────
  fotosArchivos: File[]  = [];
  private readonly MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5 MB

  // ─── Respuestas ────────────────────────────────────────
  respuestas: Respuestas = {
    alojamiento:   { texto: '', puntaje: 0 },
    reposa_patas:  { texto: '', puntaje: 0 },
    nidales:       { texto: '', puntaje: 0 },
    espacio:       { texto: '', puntaje: 0 },
    altura:        { texto: '', puntaje: 0 },
    iluminacion:   { texto: '', puntaje: 0 },
    ventilacion:   { texto: '', puntaje: 0 },
    proteccion:    { texto: '', puntaje: 0 }
  };

  // ─── Progreso ──────────────────────────────────────────
  readonly totalPreguntas = Object.keys(this.respuestas).length; // 8

  get respondidas(): number {
    return Object.values(this.respuestas).filter(v => v.texto !== '').length;
  }

  get puntajeParcial(): number {
    const seleccionadas = Object.values(this.respuestas).filter(v => v.texto !== '');
    if (!seleccionadas.length) return 0;
    return Math.round(
      seleccionadas.reduce((sum, item) => sum + item.puntaje, 0) / seleccionadas.length
    );
  }

  get nivelTexto(): string {
    const val = this.puntajeParcial;
    if (val >= 90) return 'Excelente Bienestar';
    if (val >= 75) return 'Alto Bienestar';
    if (val >= 50) return 'Bienestar Medio';
    return 'Bienestar Bajo';
  }

  get nivelClase(): string {
    const val = this.puntajeParcial;
    if (val >= 90) return 'nivel-alto';
    if (val >= 75) return 'nivel-medio';
    if (val >= 50) return 'nivel-bajo';
    return 'nivel-deficiente';
  }

  getScoreClass(puntaje: number | undefined): string {
    if (puntaje === undefined) return 'score-empty';
    if (puntaje >= 90) return 'score-high';
    if (puntaje >= 75) return 'score-medium';
    if (puntaje >= 50) return 'score-low';
    return 'score-zero';
  }

  get progresoPorc(): number {
    return Math.round((this.respondidas / this.totalPreguntas) * 100);
  }

  // ─── Opciones de evaluación ────────────────────────────
  opcionesAlojamiento: OpcionEval[] = [
    { nombre: 'Todos los puntos cumplen', puntaje: 100, active: false },
    { nombre: 'La mayoría cumple',       puntaje: 55, active: false },
    { nombre: 'Regular',                 puntaje: 20, active: false },
    { nombre: 'No cumple',              puntaje: 0,  active: false }
  ];

  opcionesReposaPatas: OpcionEval[] = [
    { nombre: 'Sí, funcionan bien', puntaje: 100, active: false },
    { nombre: 'Con fallas',         puntaje: 55, active: false },
    { nombre: 'No tienen',          puntaje: 0,  active: false }
  ];

  opcionesNidales: OpcionEval[] = [
    { nombre: 'Cumplen todas', puntaje: 100, active: false },
    { nombre: 'Mayoría cumple', puntaje: 55, active: false },
    { nombre: 'Regular', puntaje: 20, active: false },
    { nombre: 'No cumplen', puntaje: 0, active: false }
  ];

  opcionesEspacio: OpcionEval[] = [
    { nombre: 'Suficiente', puntaje: 100, active: false },
    { nombre: 'Mayoría',    puntaje: 55, active: false },
    { nombre: 'Regular',    puntaje: 20, active: false },
    { nombre: 'Insuficiente', puntaje: 0, active: false }
  ];

  opcionesAltura: OpcionEval[] = [
    { nombre: 'Correcta',   puntaje: 100, active: false },
    { nombre: 'Mayoría',    puntaje: 55, active: false },
    { nombre: 'Regular',    puntaje: 20, active: false },
    { nombre: 'Incorrecta', puntaje: 0,  active: false }
  ];

  opcionesIluminacion: OpcionEval[] = [
    { nombre: 'Suficiente',  puntaje: 100, active: false },
    { nombre: 'Mayoría',     puntaje: 55, active: false },
    { nombre: 'Regular',     puntaje: 20, active: false },
    { nombre: 'Insuficiente', puntaje: 0,  active: false }
  ];

  opcionesVentilacion: OpcionEval[] = [
    { nombre: 'Buena',   puntaje: 100, active: false },
    { nombre: 'Mayoría', puntaje: 55, active: false },
    { nombre: 'Regular', puntaje: 20, active: false },
    { nombre: 'Mala',    puntaje: 0,  active: false }
  ];

  opcionesProteccion: OpcionEval[] = [
    { nombre: 'Buena',      puntaje: 100, active: false },
    { nombre: 'Con fallas', puntaje: 55, active: false },
    { nombre: 'No tienen',  puntaje: 0,  active: false }
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  // ─── INIT ──────────────────────────────────────────────
  async ngOnInit(): Promise<void> {

  await this.cargarFincas();

  const savedId = localStorage.getItem('finca_id');
  const savedNombre = localStorage.getItem('finca_nombre');

  if (savedId) {
    this.fincaSeleccionada = savedId;
  }

  if (savedNombre) {
    this.fincaNombre = savedNombre;
  }

}

  private async cargarFincas(): Promise<void> {
    const { data, error } = await this.supabaseService.supabase
      .from('fincas')
      .select('id, nombre_finca')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando fincas:', error);
      return;
    }

    this.fincas = data ?? [];
  }

  // ─── SELECCIÓN DE FINCA ────────────────────────────────
 onFincaChange(): void {

  if (this.fincaSeleccionada) {

    localStorage.setItem(
      'finca_id',
      this.fincaSeleccionada
    );

    const finca = this.fincas.find(
      f => f.id == this.fincaSeleccionada
    );

    if (finca) {

      this.fincaNombre = finca.nombre_finca;

      localStorage.setItem(
        'finca_nombre',
        finca.nombre_finca
      );

    }

  }

}

  // ─── SELECCIÓN DE OPCIÓN ───────────────────────────────
  seleccionar(opciones: OpcionEval[], opcion: OpcionEval, campo: keyof Respuestas): void {
    opciones.forEach(o => o.active = false);
    opcion.active = true;
    this.respuestas[campo] = {
      texto: opcion.nombre,
      puntaje: opcion.puntaje ?? 0
    };
  }

  // ─── MANEJO DE FOTOS ───────────────────────────────────
  onFotosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.agregarFotos(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) this.agregarFotos(Array.from(files));
  }

  private agregarFotos(files: File[]): void {
    const validas = files.filter(f => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > this.MAX_FOTO_SIZE) return false;
      return true;
    });
    this.fotosArchivos = [...this.fotosArchivos, ...validas];
  }

  eliminarFoto(index: number, event: Event): void {
    event.stopPropagation();
    this.fotosArchivos.splice(index, 1);
  }

  // ─── VALIDACIÓN ────────────────────────────────────────
  formularioValido(): boolean {
    if (!this.fincaSeleccionada) return false;
    return Object.values(this.respuestas).every(v => v !== '');
  }

  // ─── SUBIR FOTOS A STORAGE ─────────────────────────────
  private async subirFotosInstalacion(instalacionId: number): Promise<void> {
    for (let i = 0; i < this.fotosArchivos.length; i++) {
      const file = this.fotosArchivos[i];
      const ext  = file.name.split('.').pop();
      const path = `instalaciones/${instalacionId}/foto_${i + 1}.${ext}`;

      const { error } = await this.supabaseService.supabase
        .storage
        .from('fincas-imagenes')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) console.warn(`Error subiendo foto ${i + 1}:`, error);
    }
  }

// ─── GUARDAR ───────────────────────────────────────────
async guardar(): Promise<void> {

  this.intentoGuardar = true;

  // Validación
  if (!this.formularioValido() || this.guardando) {
    return;
  }

  this.guardando = true;

  try {

    // ── Payload para Supabase ─────────────────────────
    const payload = {

      finca_id: this.fincaSeleccionada,

      // ── Alojamiento ─────────────────────
      alojamiento_respuesta: this.respuestas['alojamiento']?.texto || null,
      alojamiento_puntaje: this.respuestas['alojamiento']?.puntaje || 0,

      // ── Reposa patas ────────────────────
      reposa_patas_respuesta: this.respuestas['reposa_patas']?.texto || null,
      reposa_patas_puntaje: this.respuestas['reposa_patas']?.puntaje || 0,

      // ── Nidales ─────────────────────────
      nidales_respuesta: this.respuestas['nidales']?.texto || null,
      nidales_puntaje: this.respuestas['nidales']?.puntaje || 0,

      // ── Espacio ─────────────────────────
      espacio_respuesta: this.respuestas['espacio']?.texto || null,
      espacio_puntaje: this.respuestas['espacio']?.puntaje || 0,

      // ── Altura ──────────────────────────
      altura_respuesta: this.respuestas['altura']?.texto || null,
      altura_puntaje: this.respuestas['altura']?.puntaje || 0,

      // ── Iluminación ─────────────────────
      iluminacion_respuesta: this.respuestas['iluminacion']?.texto || null,
      iluminacion_puntaje: this.respuestas['iluminacion']?.puntaje || 0,

      // ── Ventilación ─────────────────────
      ventilacion_respuesta: this.respuestas['ventilacion']?.texto || null,
      ventilacion_puntaje: this.respuestas['ventilacion']?.puntaje || 0,

      // ── Protección ──────────────────────
      proteccion_respuesta: this.respuestas['proteccion']?.texto || null,
      proteccion_puntaje: this.respuestas['proteccion']?.puntaje || 0,

      // ── Puntaje total ───────────────────
      puntaje_total: this.puntajeParcial || 0,

      // ── Observaciones ───────────────────
      observaciones: this.observaciones || null
    };

    console.log('Payload enviado:', payload);

    // ── Guardar en Supabase ───────────────────────────
    const { data, error } = await this.supabaseService.supabase
      .from('instalaciones')
      .insert([payload])
      .select()
      .single();

    // ── Validar error ─────────────────────────────────
    if (error || !data) {

      console.error('Error guardando instalaciones:', error);

      alert('Error al guardar instalaciones');

      return;
    }

    console.log('Instalaciones guardadas:', data);

    await this.supabaseService.supabase
.from('evaluaciones')
.upsert([
  {
    finca_id: this.fincaSeleccionada,
    tipo: 'instalaciones'
  }
]);

    // ── Subir fotos si existen ───────────────────────
    if (this.fotosArchivos.length > 0) {

      await this.subirFotosInstalacion(data.id);

    }

    // ── Éxito ────────────────────────────────────────
    alert('Instalaciones guardadas correctamente ✓');

    this.intentoGuardar = false;

    // Navegar siguiente página
    this.router.navigate(['/evaluaciones/observacion']);

  } catch (err) {

    console.error('Error inesperado:', err);

    alert('Ocurrió un error inesperado');

  } finally {

    this.guardando = false;

  }
}
}