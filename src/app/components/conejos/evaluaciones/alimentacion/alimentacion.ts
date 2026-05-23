import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-alimentacion',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterModule],
  templateUrl: './alimentacion.html',
  styleUrls: ['./alimentacion.scss']
})
export class AlimentacionComponent implements OnInit {

  constructor(
    public router: Router,
    private supabase: SupabaseService
  ) {}

  // ─── ESTADO UI ───────────────────────────────────────────────
  guardando        = false;
  errorGuardar     = '';

  // ─── IMÁGENES ────────────────────────────────────────────────
  subiendoImagen = false;
  errorImagen    = '';
  imagenesSubidas: { url: string; path: string; nombre: string }[] = [];

  // ─── FINCA ───────────────────────────────────────────────────
  fincaNombre = '';
  fincaId     = '';

  ngOnInit(): void {
    this.fincaId     = localStorage.getItem('finca_id')     || '';
    this.fincaNombre = localStorage.getItem('finca_nombre') || '';
  }

  // ─── RESPUESTAS ──────────────────────────────────────────────
  respuestas:   Record<string, number> = {};
  observaciones = '';

  // ─── PREGUNTAS ───────────────────────────────────────────────
  preguntas: string[] = [
    'comederos_limpios', 'comederos_mantenimiento', 'acceso_alimento',
    'alimento_ica', 'almacenamiento',
    'oferta_forraje',
    'leche_materna', 'alimento_solido',
    'suficientes_bebederos', 'agua_voluntad', 'acceso_agua',
    'calidad_agua', 'estado_bebederos', 'altura_bebederos'
  ];

  // ─── BLOQUES ─────────────────────────────────────────────────
  bloques = [
    { nombre: 'Comederos',          icono: 'restaurant', color: '#2563eb', keys: ['comederos_limpios','comederos_mantenimiento','acceso_alimento'] },
    { nombre: 'Alimento Balanceado',icono: 'verified',   color: '#0d9488', keys: ['alimento_ica','almacenamiento'] },
    { nombre: 'Forraje',            icono: 'grass',      color: '#16a34a', keys: ['oferta_forraje'] },
    { nombre: 'Gazapos',            icono: 'pets',       color: '#7c3aed', keys: ['leche_materna','alimento_solido'] },
    { nombre: 'Agua y Bebederos',   icono: 'water_drop', color: '#1d4ed8', keys: ['suficientes_bebederos','agua_voluntad','acceso_agua','calidad_agua','estado_bebederos','altura_bebederos'] }
  ];

  // ─── OPCIONES ────────────────────────────────────────────────
  opcionesComederoLimpio = [
    { valor: 100, texto: 'Todos los comederos cumplen',      criterio: '100% limpios, en buen estado y permiten acceso al alimento' },
    { valor: 55,  texto: 'Más del 80% cumplen',              criterio: 'Más del 80% limpios, en buen estado y con acceso al alimento' },
    { valor: 20,  texto: 'Entre el 61% y 80% cumplen',       criterio: 'Entre 61% y 80% limpios, en buen estado y con acceso' },
    { valor: 0,   texto: 'El 60% o menos cumplen',           criterio: '60% o menos limpios, en buen estado o con acceso al alimento' }
  ];

  opcionesAlimentoBalanceado = [
    { valor: 100, texto: 'Se cumplen las dos condiciones',   criterio: 'Registro ICA vigente y almacenamiento adecuado' },
    { valor: 55,  texto: 'Solo se cumple una condición',     criterio: 'Registro ICA o almacenamiento adecuado' },
    { valor: 0,   texto: 'No se cumple ninguna condición',   criterio: 'Sin registro ICA ni almacenamiento adecuado' }
  ];

  opcionesForraje = [
    { valor: 100, texto: 'Existe oferta en pasteras o comederos', criterio: 'Forraje disponible con comedero o pastera' },
    { valor: 55,  texto: 'Existe oferta pero sin comederos',      criterio: 'Hay forraje pero sin pasteras' },
    { valor: 0,   texto: 'No existe oferta de forraje',           criterio: 'Los animales no tienen acceso' }
  ];

  opcionesGazapos = [
    { valor: 100, texto: 'Se garantiza y controla el acceso', criterio: 'Leche materna y alimento sólido' },
    { valor: 0,   texto: 'No se garantiza el acceso',         criterio: 'No cumplen condiciones' }
  ];

  opcionesAgua = [
    { valor: 100, texto: 'Todos los bebederos cumplen',   criterio: 'Agua limpia y suficiente' },
    { valor: 55,  texto: 'Más del 80% cumplen',           criterio: 'Más del 80% adecuados' },
    { valor: 20,  texto: 'Entre el 50% y 80% cumplen',    criterio: 'Entre 50% y 80%' },
    { valor: 0,   texto: 'No tienen acceso adecuado',     criterio: 'Menos del 50%' }
  ];

  opcionesEstadoBebederos = [
    { valor: 100, texto: 'Todos en buen estado',    criterio: '100% funcionales' },
    { valor: 55,  texto: 'Más del 80%',             criterio: 'Más del 80% funcionales' },
    { valor: 20,  texto: 'Entre el 70% y 80%',      criterio: '70% a 80%' },
    { valor: 0,   texto: 'Menos del 70%',           criterio: 'Menos del 70%' }
  ];

  opcionesAlturaBebederos = [
    { valor: 100, texto: 'Todos a altura apropiada', criterio: 'Altura correcta' },
    { valor: 55,  texto: 'Más del 80%',              criterio: 'Más del 80%' },
    { valor: 20,  texto: 'Entre el 70% y 80%',       criterio: '70% a 80%' },
    { valor: 0,   texto: 'Menos del 70%',            criterio: 'Menos del 70%' }
  ];

  // ─── MÉTODOS EVALUACIÓN ──────────────────────────────────────
  seleccionar(key: string, valor: number): void {
    this.respuestas[key] = valor;
  }

  calcularSubtotal(): number {
    const valores = Object.values(this.respuestas);
    if (!valores.length) return 0;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }

  getPromedioBloque(keys: string[]): number {
    const vals = keys.filter(k => this.respuestas[k] !== undefined).map(k => this.respuestas[k]);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  getTotalRespondidas(): number {
    return this.preguntas.filter(k => this.respuestas[k] !== undefined).length;
  }

  // ─── GAUGE ───────────────────────────────────────────────────
  private readonly CIRCUNFERENCIA = 402.12;

  getGaugeOffset(): number {
    return this.CIRCUNFERENCIA * (1 - this.calcularSubtotal() / 100);
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
    if (!Object.keys(this.respuestas).length) return 'Sin respuestas';
    const val = this.calcularSubtotal();
    if (val >= 90) return 'Excelente Bienestar';
    if (val >= 75) return 'Alto Bienestar';
    if (val >= 50) return 'Bienestar Medio';
    return 'Bienestar Bajo';
  }

  // ─── IMÁGENES ────────────────────────────────────────────────

  async onImagenesSeleccionadas(event: Event): Promise<void> {
    const input   = event.target as HTMLInputElement;
    const archivos = Array.from(input.files || []);
    if (!archivos.length) return;

    this.errorImagen    = '';
    this.subiendoImagen = true;

    for (const archivo of archivos) {

      // Validar tamaño (5 MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.errorImagen = `"${archivo.name}" supera el límite de 5 MB.`;
        continue;
      }

      // Validar tipo
      if (!archivo.type.startsWith('image/')) {
        this.errorImagen = `"${archivo.name}" no es una imagen válida.`;
        continue;
      }

      const extension = archivo.name.split('.').pop();
      const path = `alimentacion/${this.fincaId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

      try {
        const { error } = await this.supabase.supabase.storage
          .from('fincas-imagenes')
          .upload(path, archivo, { upsert: false, contentType: archivo.type });

        if (error) {
          this.errorImagen = `Error subiendo "${archivo.name}": ${error.message}`;
          continue;
        }

        const { data } = this.supabase.supabase.storage
          .from('fincas-imagenes')
          .getPublicUrl(path);

        this.imagenesSubidas.push({
          url:    data.publicUrl,
          path,
          nombre: archivo.name
        });

      } catch (err) {
        this.errorImagen = 'Error inesperado subiendo imagen.';
      }
    }

    // Limpiar input para permitir subir el mismo archivo de nuevo
    input.value = '';
    this.subiendoImagen = false;
  }

  async eliminarImagen(index: number): Promise<void> {
    const img = this.imagenesSubidas[index];
    try {
      await this.supabase.supabase.storage.from('fincas-imagenes').remove([img.path]);
    } catch (e) {
      // Si falla el borrado en storage igual la quitamos de la vista
    }
    this.imagenesSubidas.splice(index, 1);
  }

  // ─── GUARDAR ─────────────────────────────────────────────────

  async guardar(): Promise<void> {
    if (!this.fincaId) {
      this.errorGuardar = 'No hay una finca seleccionada.';
      return;
    }

    const faltantes = this.preguntas.filter(p => this.respuestas[p] === undefined);
    if (faltantes.length > 0) {
      this.errorGuardar = 'Debes responder todas las preguntas antes de guardar.';
      return;
    }

    this.guardando    = true;
    this.errorGuardar = '';

    try {
      const urlsImagenes = this.imagenesSubidas.map(i => i.url);

      const payload = {
        finca_id:                this.fincaId,
        comederos_limpios:       this.respuestas['comederos_limpios']       ?? 0,
        comederos_mantenimiento: this.respuestas['comederos_mantenimiento'] ?? 0,
        acceso_alimento:         this.respuestas['acceso_alimento']         ?? 0,
        alimento_ica:            this.respuestas['alimento_ica']            ?? 0,
        almacenamiento:          this.respuestas['almacenamiento']          ?? 0,
        oferta_forraje:          this.respuestas['oferta_forraje']          ?? 0,
        leche_materna:           this.respuestas['leche_materna']           ?? 0,
        alimento_solido:         this.respuestas['alimento_solido']         ?? 0,
        suficientes_bebederos:   this.respuestas['suficientes_bebederos']   ?? 0,
        agua_voluntad:           this.respuestas['agua_voluntad']           ?? 0,
        acceso_agua:             this.respuestas['acceso_agua']             ?? 0,
        calidad_agua:            this.respuestas['calidad_agua']            ?? 0,
        estado_bebederos:        this.respuestas['estado_bebederos']        ?? 0,
        altura_bebederos:        this.respuestas['altura_bebederos']        ?? 0,
        observaciones:           this.observaciones || null,
        imagenes:                urlsImagenes.length ? urlsImagenes : null,
        subtotal:                parseFloat(this.calcularSubtotal().toFixed(2))
      };

      const { error } = await this.supabase.supabase
        .from('alimentacion')
        .upsert([payload], { onConflict: 'finca_id' });

      if (error) {
        this.errorGuardar = 'Error guardando la evaluación de alimentación.';
        console.error(error);
        return;
      }

      const { error: errorEval } = await this.supabase.supabase
        .from('evaluaciones')
        .upsert([{ finca_id: this.fincaId, tipo: 'alimentacion' }], { onConflict: 'finca_id,tipo' });

      if (errorEval) console.error('Error evaluaciones:', errorEval);

      localStorage.setItem('alimentacion_completa', 'true');
      this.router.navigate(['/evaluaciones/instalaciones']);

    } catch (err) {
      console.error(err);
      this.errorGuardar = 'Ocurrió un error inesperado.';
    } finally {
      this.guardando = false;
    }
  }
}