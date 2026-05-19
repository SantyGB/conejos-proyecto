import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { SupabaseService } from '../../../../services/supabase.service';

interface FincaRegistro {
  id?: string;
  nombreFinca: string;
  propietario: string;
  ubicacion: string;
  telefono: string;
  tipoProductor: string;
  totalConejos: number;
  empleados: number;
  fechaVisita: string;
  tecnico: string;
  imagenUrl?: string | null;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent implements OnInit {

  form: FincaRegistro = {
    nombreFinca: '',
    propietario: '',
    ubicacion: '',
    telefono: '',
    tipoProductor: '',
    totalConejos: 0,
    empleados: 0,
    fechaVisita: '',
    tecnico: ''
  };

  muestraCalculada = 0;
  muestraRegla    = '';
  fincas: FincaRegistro[] = [];

  // ─── Estado imagen ─────────────────────────────────────
  imagenPreview: string | null = null;
  imagenNombre:  string        = '';
  imagenError:   string        = '';
  imagenArchivo: File | null   = null;
  isDragging:    boolean       = false;
  guardando:     boolean       = false;

  private readonly MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  // ─── INIT ──────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    await this.cargarFincas();
  }

  private async cargarFincas(): Promise<void> {
    const { data, error } = await this.supabaseService.supabase
      .from('fincas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error cargando fincas:', error);
      return;
    }

    // Mapea snake_case → camelCase para la vista
    this.fincas = (data ?? []).map((f: any) => ({
      id:            f.id,
      nombreFinca:   f.nombre_finca,
      propietario:   f.propietario,
      ubicacion:     f.ubicacion,
      telefono:      f.telefono,
      tipoProductor: f.tipo_productor,
      totalConejos:  f.total_conejos,
      empleados:     f.empleados,
      fechaVisita:   f.fecha_visita,
      tecnico:       f.tecnico,
      imagenUrl:     f.imagen_url ?? null
    }));
  }

  // ─── CÁLCULO MUESTRA ───────────────────────────────────
  calcularMuestra(): void {
    const total = Number(this.form.totalConejos) || 0;
    const tipo  = this.form.tipoProductor;

    if (!tipo || total <= 0) {
      this.muestraCalculada = 0;
      this.muestraRegla     = '';
      return;
    }

    let muestra = 0;
    let regla   = '';

    switch (tipo) {
      case 'pequeno':
        muestra = Math.max(3, Math.ceil(total * 0.15));
        regla   = 'Pequeño: al menos 15% del total, mínimo 3 conejos.';
        break;
      case 'mediano':
        muestra = Math.max(5, Math.ceil(total * 0.10));
        regla   = 'Mediano: al menos 10% del total, mínimo 5 conejos.';
        break;
      case 'intensivo':
        muestra = Math.max(10, Math.ceil(total * 0.08));
        regla   = 'Intensivo: al menos 8% del total, mínimo 10 conejos.';
        break;
      default:
        muestra = Math.ceil(total * 0.1);
        regla   = 'Cálculo estándar: 10% del total.';
    }

    this.muestraCalculada = muestra;
    this.muestraRegla     = regla;
  }

  // ─── VALIDACIÓN ────────────────────────────────────────
  formularioValido(): boolean {
    return Boolean(
      this.form.nombreFinca.trim()  &&
      this.form.propietario.trim()  &&
      this.form.ubicacion.trim()    &&
      this.form.telefono.trim()     &&
      this.form.tipoProductor       &&
      Number(this.form.totalConejos) > 0 &&
      this.form.fechaVisita         &&
      this.form.tecnico.trim()
    );
  }

  // ─── MANEJO DE IMAGEN ──────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.procesarArchivo(input.files[0]);
      input.value = ''; // permite re-seleccionar el mismo archivo
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
    const file = event.dataTransfer?.files?.[0];
    if (file) this.procesarArchivo(file);
  }

  private procesarArchivo(file: File): void {
    this.imagenError = '';

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      this.imagenError = 'Formato no permitido. Usa JPG, PNG o WEBP.';
      return;
    }

    if (file.size > this.MAX_SIZE_BYTES) {
      this.imagenError = 'El archivo supera el límite de 5 MB.';
      return;
    }

    this.imagenArchivo = file;
    this.imagenNombre  = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.imagenNombre  = '';
    this.imagenError   = '';
    this.imagenArchivo = null;
  }

  // ─── SUBIR IMAGEN A SUPABASE STORAGE ──────────────────
  private async subirImagen(fincaId: string): Promise<string | null> {
    if (!this.imagenArchivo) return null;

    const ext       = this.imagenArchivo.name.split('.').pop();
    const path      = `${fincaId}.${ext}`;                // ej: uuid.jpg
    const bucketId  = 'fincas-imagenes';

    const { error } = await this.supabaseService.supabase
      .storage
      .from(bucketId)
      .upload(path, this.imagenArchivo, {
        upsert: true,           // sobreescribe si ya existe
        contentType: this.imagenArchivo.type
      });

    if (error) {
      console.error('Error subiendo imagen:', error);
      return null;
    }

    // Devuelve la URL pública
    const { data } = this.supabaseService.supabase
      .storage
      .from(bucketId)
      .getPublicUrl(path);

    return data.publicUrl ?? null;
  }

  // ─── GUARDAR ───────────────────────────────────────────
  async guardar(): Promise<void> {
    if (!this.formularioValido() || this.guardando) return;

    this.guardando = true;

    try {
      // 1. Inserta la finca (sin imagen aún para obtener el id)
      const { data: inserted, error: insertError } = await this.supabaseService.supabase
        .from('fincas')
        .insert([{
          nombre_finca:   this.form.nombreFinca,
          propietario:    this.form.propietario,
          ubicacion:      this.form.ubicacion,
          telefono:       this.form.telefono,
          tipo_productor: this.form.tipoProductor,
          total_conejos:  this.form.totalConejos,
          empleados:      this.form.empleados,
          fecha_visita:   this.form.fechaVisita,
          tecnico:        this.form.tecnico,
          imagen_url:     null
        }])
        .select()
        .single();

      if (insertError || !inserted) {
        console.error('Error guardando finca:', insertError);
        alert('Error al guardar la finca. Revisa la consola.');
        return;
      }

      const fincaId = inserted.id as string;

      // 2. Si hay imagen, súbela y actualiza el registro
      let imagenUrl: string | null = null;
      if (this.imagenArchivo) {
        imagenUrl = await this.subirImagen(fincaId);

        if (imagenUrl) {
          await this.supabaseService.supabase
            .from('fincas')
            .update({ imagen_url: imagenUrl })
            .eq('id', fincaId);
        }
      }

      alert('Finca guardada correctamente ✓');

      // 3. Reset
      this.form = {
        nombreFinca: '', propietario: '', ubicacion: '',
        telefono: '', tipoProductor: '', totalConejos: 0,
        empleados: 0, fechaVisita: '', tecnico: ''
      };
      this.muestraCalculada = 0;
      this.muestraRegla     = '';
      this.eliminarImagen();

      // 4. Recarga la tabla
      await this.cargarFincas();

    } finally {
      this.guardando = false;
    }
  }

  // ─── HELPERS ───────────────────────────────────────────
  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'pequeno':   return 'Pequeño';
      case 'mediano':   return 'Mediano';
      case 'intensivo': return 'Intensivo';
      default:          return 'No definido';
    }
  }

  verFinca(finca: FincaRegistro): void {
    console.log('Ver finca:', finca);
  }

  evaluarFinca(finca: FincaRegistro): void {
    console.log('Evaluar finca:', finca);
  }
}