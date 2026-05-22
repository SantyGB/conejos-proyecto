import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-granjas',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './granjas.html',
  styleUrls: ['./granjas.scss']
})
export class GranjasComponent implements OnInit {

  granjas:    any[] = [];
  filtradas:  any[] = [];
  busqueda:   string = '';
  cargando:   boolean = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.cargarGranjas();
  }

async cargarGranjas() {
  this.cargando = true;

  // Query 1: fincas
  const { data: fincas, error } = await this.supabaseService.supabase
    .from('fincas')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error cargando granjas:', error);
    this.cargando = false;
    return;
  }

  // Query 2: evaluaciones finales (separada)
  const { data: evaluaciones, error: error2 } = await this.supabaseService.supabase
    .from('evaluacion_final')
    .select('*');

  if (error2) {
    console.error('Error cargando evaluaciones:', error2);
  }

  console.log('FINCAS:', fincas);
  console.log('EVALUACIONES:', evaluaciones);

  // Mapear evaluaciones por finca_id
  const evalMap: Record<string, any> = {};
  for (const ev of evaluaciones || []) {
    evalMap[ev.finca_id] = ev;
  }

  console.log('EVAL MAP:', evalMap);

  // Unir manualmente
  this.granjas = (fincas || [])
    .map(f => {
      const eval_data = evalMap[f.id];
      console.log(`Finca ${f.nombre_finca} (${f.id}) → eval:`, eval_data);
      return {
        ...f,
        evaluacion_final: eval_data ? [eval_data] : []
      };
    })
    .sort((a, b) => {
      const pa = a.evaluacion_final?.[0]?.resultado_total || 0;
      const pb = b.evaluacion_final?.[0]?.resultado_total || 0;
      return pb - pa;
    });

  this.filtradas = [...this.granjas];
  this.cargando  = false;
}

  // ─── BÚSQUEDA ────────────────────────────────────────────────
  filtrar(): void {
    const q = this.busqueda.toLowerCase().trim();
    this.filtradas = q
      ? this.granjas.filter(
          g =>
            g.nombre_finca?.toLowerCase().includes(q) ||
            g.ubicacion?.toLowerCase().includes(q)     ||
            g.propietario?.toLowerCase().includes(q)
        )
      : [...this.granjas];
  }

  // ─── KPIs ────────────────────────────────────────────────────
  get totalConejos(): number {
    return this.granjas.reduce((acc, g) => acc + (g.total_conejos || 0), 0);
  }

  get puntajeMasAlto(): number {
    if (!this.granjas.length) return 0;
    return Math.max(
      ...this.granjas.map(g => g.evaluacion_final?.[0]?.resultado_total || 0)
    );
  }

  get promedioSalud(): number {
    const conRes = this.granjas.filter(
      g => g.evaluacion_final?.[0]?.resultado_total
    );
    if (!conRes.length) return 0;
    const suma = conRes.reduce(
      (acc, g) => acc + (g.evaluacion_final[0].resultado_total || 0), 0
    );
    return Math.round(suma / conRes.length);
  }

  // ─── HELPERS ─────────────────────────────────────────────────
  obtenerNivel(puntaje: number): string {
    if (puntaje >= 85) return 'Nivel Alto';
    if (puntaje >= 60) return 'Nivel Medio';
    return 'Nivel Bajo';
  }

  getColor(puntaje: number): string {
    if (puntaje >= 85) return '#22c55e';
    if (puntaje >= 60) return '#f59e0b';
    return '#ef4444';
  }

  tieneResultado(granja: any): boolean {
    return !!granja.evaluacion_final?.[0]?.resultado_total;
  }
  
  // Modal edición
mostrarModal = false;
granjaEditando: any = null;
guardandoEdicion = false;

abrirEdicion(granja: any): void {
  this.granjaEditando = { ...granja }; // copia para no mutar el original
  this.mostrarModal = true;
}

cerrarModal(): void {
  this.mostrarModal = false;
  this.granjaEditando = null;
}

async guardarEdicion(): Promise<void> {
  if (!this.granjaEditando) return;
  this.guardandoEdicion = true;

  const { error } = await this.supabaseService.supabase
    .from('fincas')
    .update({
      nombre_finca:   this.granjaEditando.nombre_finca,
      propietario:    this.granjaEditando.propietario,
      ubicacion:      this.granjaEditando.ubicacion,
      telefono:       this.granjaEditando.telefono,
      tipo_productor: this.granjaEditando.tipo_productor,
      total_conejos:  this.granjaEditando.total_conejos,
      empleados:      this.granjaEditando.empleados,
      fecha_visita:   this.granjaEditando.fecha_visita,
      tecnico:        this.granjaEditando.tecnico,
      imagen_url:     this.granjaEditando.imagen_url
    })
    .eq('id', this.granjaEditando.id);

  this.guardandoEdicion = false;

  if (error) {
    console.error('Error actualizando granja:', error);
    alert('Error al guardar. Revisa la consola.');
    return;
  }

  this.cerrarModal();
  await this.cargarGranjas(); // refresca la lista
}

async confirmarEliminar(granja: any): Promise<void> {
  const confirmar = confirm(`¿Eliminar "${granja.nombre_finca}"? Esta acción no se puede deshacer.`);
  if (!confirmar) return;

  const { error } = await this.supabaseService.supabase
    .from('fincas')
    .delete()
    .eq('id', granja.id);

  if (error) {
    console.error('Error eliminando granja:', error);
    alert('Error al eliminar. Revisa la consola.');
    return;
  }

  await this.cargarGranjas();
}
}