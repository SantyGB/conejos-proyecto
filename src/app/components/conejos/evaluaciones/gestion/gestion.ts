import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './gestion.html',
  styleUrls: ['./gestion.scss']
})
export class GestionComponent implements OnInit {

  // ===== FINCA =====

  fincaNombre: string = '';

  // ===== ESTADO =====

  imagenes: string[] = [];

  observaciones: string = '';

  respuestas: any = {
    mortalidad_gazapos: '',
    mortalidad_engorde: '',
    mortalidad_reproductores: '',
    manejo_predio: '',
    plan_sanitario: '',
    medicamentos_legales: '',
    contingencia_desastres: ''
  };

  constructor(
    private supabaseService: SupabaseService,
    public router: Router
  ) {}

  // ===== INIT =====

  ngOnInit(): void {

    const nombre = localStorage.getItem('finca_nombre');

    if (nombre) {

      this.fincaNombre = nombre;

    }

  }

  // ===== OPCIONES =====

  mortalidadGazapos = [
    { nombre: 'Menor del 25%', puntaje: 100 },
    { nombre: 'Entre 25% y 30%', puntaje: 55 },
    { nombre: 'Superior al 30%', puntaje: 0 }
  ];

  mortalidadEngorde = [
    { nombre: 'Menor del 15%', puntaje: 100 },
    { nombre: 'Entre 15% y 20%', puntaje: 55 },
    { nombre: 'Superior al 20%', puntaje: 0 }
  ];

  mortalidadReproductores = [
    { nombre: 'Menor del 5%', puntaje: 100 },
    { nombre: 'Entre 5% y 8%', puntaje: 55 },
    { nombre: 'Superior al 8%', puntaje: 0 }
  ];

  manejoPredio = [
    { nombre: 'Documentado e implementado', puntaje: 100 },
    { nombre: 'Existe escrito pero no implementado', puntaje: 55 },
    { nombre: 'Buen manejo sin documento', puntaje: 20 },
    { nombre: 'No existe protocolo', puntaje: 0 }
  ];

  planSanitario = [
    { nombre: 'Firmado e implementado', puntaje: 100 },
    { nombre: 'Hay registros pero sin plan', puntaje: 55 },
    { nombre: 'Existe pero no implementado', puntaje: 20 },
    { nombre: 'No existe plan', puntaje: 0 }
  ];

  medicamentos = [
    { nombre: 'Cumple todas las BPUMV', puntaje: 100 },
    { nombre: 'Cumple con fallas menores', puntaje: 55 },
    { nombre: 'Medicamentos sin control veterinario', puntaje: 20 },
    { nombre: 'Medicamentos prohibidos o vencidos', puntaje: 0 }
  ];

  contingencia = [
    { nombre: 'Existe e implementado', puntaje: 100 },
    { nombre: 'Existe pero no implementado', puntaje: 55 },
    { nombre: 'No existe pero hay conocimiento', puntaje: 20 },
    { nombre: 'No existe plan', puntaje: 0 }
  ];

  // ===== OBTENER PUNTAJE =====

  obtenerPuntaje(
    lista: any[],
    valor: string
  ): number {

    const encontrado =
      lista.find(op => op.nombre === valor);

    return encontrado
      ? encontrado.puntaje
      : 0;

  }

  // ===== SELECCIONAR OPCIONES =====

  seleccionar(
  valor: string,
  campo: string
): void {

  console.log('Seleccionado:', campo, valor);

  this.respuestas[campo] = valor;

}

  // ===== SUBIR FOTOS =====

  subirFotos(event: any): void {

    const archivos = event.target.files;

    this.imagenes = [];

    for (let file of archivos) {

      this.imagenes.push(file.name);

    }

  }

  // ===== GUARDAR =====

  async guardar(): Promise<void> {

    const fincaId =
      localStorage.getItem('finca_id');

    if (!fincaId) {

      alert('No hay finca seleccionada');

      return;

    }

    // ===== PUNTAJES =====

    const mortalidadGazaposPuntaje =
      this.obtenerPuntaje(
        this.mortalidadGazapos,
        this.respuestas.mortalidad_gazapos
      );

    const mortalidadEngordePuntaje =
      this.obtenerPuntaje(
        this.mortalidadEngorde,
        this.respuestas.mortalidad_engorde
      );

    const mortalidadReproductoresPuntaje =
      this.obtenerPuntaje(
        this.mortalidadReproductores,
        this.respuestas.mortalidad_reproductores
      );

    const manejoPredioPuntaje =
      this.obtenerPuntaje(
        this.manejoPredio,
        this.respuestas.manejo_predio
      );

    const planSanitarioPuntaje =
      this.obtenerPuntaje(
        this.planSanitario,
        this.respuestas.plan_sanitario
      );

    const medicamentosLegalesPuntaje =
      this.obtenerPuntaje(
        this.medicamentos,
        this.respuestas.medicamentos_legales
      );

    const contingenciaPuntaje =
      this.obtenerPuntaje(
        this.contingencia,
        this.respuestas.contingencia_desastres
      );

    // ===== PAYLOAD =====

    const payload = {

      finca_id: fincaId,

      mortalidad_gazapos:
        this.respuestas.mortalidad_gazapos || null,

      mortalidad_engorde:
        this.respuestas.mortalidad_engorde || null,

      mortalidad_reproductores:
        this.respuestas.mortalidad_reproductores || null,

      manejo_predio:
        this.respuestas.manejo_predio || null,

      plan_sanitario:
        this.respuestas.plan_sanitario || null,

      medicamentos_legales:
        this.respuestas.medicamentos_legales || null,

      contingencia_desastres:
        this.respuestas.contingencia_desastres || null,

      observaciones:
        this.observaciones || null,

      // ===== PUNTAJES =====

      mortalidad_gazapos_puntaje:
        mortalidadGazaposPuntaje,

      mortalidad_engorde_puntaje:
        mortalidadEngordePuntaje,

      mortalidad_reproductores_puntaje:
        mortalidadReproductoresPuntaje,

      manejo_predio_puntaje:
        manejoPredioPuntaje,

      plan_sanitario_puntaje:
        planSanitarioPuntaje,

      medicamentos_legales_puntaje:
        medicamentosLegalesPuntaje,

      contingencia_desastres_puntaje:
        contingenciaPuntaje
    };

    console.log('GESTION PAYLOAD', payload);

    const { error } =
      await this.supabaseService.supabase
        .from('gestion')
        .upsert([payload], { onConflict: 'finca_id' });

    if (error) {

      console.error(
        'Error guardando gestión:',
        error
      );

      alert('Error guardando gestión');

      return;

    }

    await this.supabaseService.supabase
      .from('evaluaciones')
      .upsert([
        {
          finca_id: fincaId,
          tipo: 'gestion'
        }
      ]);

    alert(
      'Gestión guardada correctamente'
    );

    this.router.navigate([
      '/evaluaciones/capacitacion'
    ]);

  }

}