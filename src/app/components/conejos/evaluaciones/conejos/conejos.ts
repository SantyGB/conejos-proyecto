import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SupabaseService } from '../../../../services/supabase.service';

@Component({
  selector: 'app-conejos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './conejos.html',
  styleUrls: ['./conejos.scss']
})
export class ConejosComponent implements OnInit {

  totalConejos: number    = 0;
  cantidadJaulas: number  = 0;
  fincaNombre: string     = '';
  muestraNumero: number   = 0;
  notaMuestra: string     = '';
  gruposSeleccionados: string[] = [];

  grupos = [
    'Gazapos',
    'Levante / Engorde',
    'Hembras de cría',
    'Machos reproductores'
  ];

  // ─── OPCIONES ──────────────────────────────────────────────────────

  opcionesProductor = [
    {
      label: 'Pequeño productor',
      descripcion: 'Hasta 10 hembras reproductoras, jaulas rústicas, autoconsumo',
      valor: 'pequeno',
      puntos: 100
    },
    {
      label: 'Mediano productor',
      descripcion: '11 a 100 hembras reproductoras, jaulas convencionales, venta',
      valor: 'mediano',
      puntos: 100
    },
    {
      label: 'Intensivo',
      descripcion: 'Más de 100 hembras reproductoras, alimento balanceado, venta',
      valor: 'intensivo',
      puntos: 100
    }
  ];

  opcionesSiNo = [
    {
      label: 'Sí, completamente',
      descripcion: 'Todos los grupos están identificados y separados correctamente',
      valor: 'si_completo',
      puntos: 100
    },
    {
      label: 'Parcialmente',
      descripcion: 'Algunos grupos están identificados pero no todos',
      valor: 'parcial',
      puntos: 55
    },
    {
      label: 'No',
      descripcion: 'No están identificados ni separados por etapa productiva',
      valor: 'no',
      puntos: 0
    }
  ];

  // ─── RESPUESTAS Y PUNTAJES ─────────────────────────────────────────

  respuestas: { [key: string]: string } = {};
  puntajes:   { [key: string]: number } = {};

  get puntajeTotal(): number {
    return Object.values(this.puntajes).reduce((a, b) => a + b, 0);
  }

  get porcentajePuntaje(): number {
    return (this.puntajeTotal / 300) * 100;
  }

  // ─────────────────────────────────────────────────────────────────

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    const nombre = localStorage.getItem('finca_nombre');
    if (nombre) this.fincaNombre = nombre;
  }

  // ─── GRUPOS ────────────────────────────────────────────────────────

  toggleGrupo(grupo: string) {
    if (this.gruposSeleccionados.includes(grupo)) {
      this.gruposSeleccionados = this.gruposSeleccionados.filter(g => g !== grupo);
    } else {
      this.gruposSeleccionados.push(grupo);
    }
  }

  estaActivo(grupo: string): boolean {
    return this.gruposSeleccionados.includes(grupo);
  }

  iconoGrupo(grupo: string): string {
    const iconos: { [key: string]: string } = {
      'Gazapos':              'child_care',
      'Levante / Engorde':    'trending_up',
      'Hembras de cría':      'female',
      'Machos reproductores': 'male'
    };
    return iconos[grupo] ?? 'pets';
  }

  // ─── MUESTRA (tabla ICA) ────────────────────────────────────────────

  calcularMuestra() {
    const total = this.totalConejos;

    if (!total || total <= 0) {
      this.muestraNumero = 0;
      this.notaMuestra   = '';
      return;
    }

    if (total <= 50) {
      this.muestraNumero = total;
      this.notaMuestra   = 'Se evalúan todos los animales (≤ 50)';
    } else if (total <= 100) {
      this.muestraNumero = 50;
      this.notaMuestra   = 'Muestra fija: 51 a 100 animales';
    } else if (total <= 500) {
      this.muestraNumero = 80;
      this.notaMuestra   = 'Muestra fija: 101 a 500 animales';
    } else {
      this.muestraNumero = Math.round(total * 0.15);
      this.notaMuestra   = '15% del total (más de 500 animales)';
    }
  }

  // ─── SELECCIONAR RESPUESTA ─────────────────────────────────────────

  seleccionar(pregunta: string, valor: string, puntos: number) {
    this.respuestas[pregunta] = valor;
    this.puntajes[pregunta]   = puntos;
  }

  // ─── VALIDACIÓN ────────────────────────────────────────────────────

  formularioValido(): boolean {
    return (
      this.totalConejos > 0 &&
      this.gruposSeleccionados.length > 0 &&
      Object.keys(this.respuestas).length === 3
    );
  }

  // ─── GUARDAR ───────────────────────────────────────────────────────

  async guardar() {
    const fincaId = localStorage.getItem('finca_id');

    if (!fincaId) { alert('No hay finca seleccionada'); return; }
    if (!this.formularioValido()) { alert('Completa todos los campos'); return; }

    const { error } = await this.supabaseService.supabase
      .from('conejos')
      .insert([{
        finca_id:        fincaId,
        total_conejos:   this.totalConejos,
        cantidad_jaulas: this.cantidadJaulas,
        grupos:          this.gruposSeleccionados.join(', '),
        muestra:         this.muestraNumero,

        sistema_productivo:           this.respuestas['sistema_productivo']  ?? null,
        grupos_identificados:         this.respuestas['grupos_identificados'] ?? null,
        distribucion_jaulas:          this.respuestas['distribucion_jaulas']  ?? null,

        puntaje_sistema_productivo:   this.puntajes['sistema_productivo']  ?? 0,
        puntaje_grupos_identificados: this.puntajes['grupos_identificados'] ?? 0,
        puntaje_distribucion_jaulas:  this.puntajes['distribucion_jaulas']  ?? 0,

        puntaje_total: this.puntajeTotal,
        porcentaje:    this.porcentajePuntaje
      }]);

    if (error) { console.error(error); alert('Error: ' + error.message); return; }

   await this.supabaseService.supabase
  .from('evaluaciones')
  .upsert([{
        finca_id:   fincaId,
        tipo:       'conejos',
        puntaje:    this.puntajeTotal,
        porcentaje: this.porcentajePuntaje
      }]);

    alert('Guardado correctamente');
    this.router.navigate(['/evaluaciones/alimentacion']);
  }
}