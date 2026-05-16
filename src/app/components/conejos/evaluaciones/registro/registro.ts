import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

interface FincaRegistro {
  nombreFinca: string;
  propietario: string;
  ubicacion: string;
  telefono: string;
  tipoProductor: string;
  totalConejos: number;
  empleados: number;
  fechaVisita: string;
  tecnico: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.scss']
})
export class RegistroComponent {
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
  muestraRegla = '';
  fincas: FincaRegistro[] = [];

  constructor(private router: Router) {}

  calcularMuestra(): void {
    const total = Number(this.form.totalConejos) || 0;
    const tipo = this.form.tipoProductor;

    if (!tipo || total <= 0) {
      this.muestraCalculada = 0;
      this.muestraRegla = '';
      return;
    }

    let muestra = 0;
    let regla = '';

    switch (tipo) {
      case 'pequeno':
        muestra = Math.max(3, Math.ceil(total * 0.15));
        regla = 'Pequeño: al menos 15% del total, mínimo 3 conejos.';
        break;
      case 'mediano':
        muestra = Math.max(5, Math.ceil(total * 0.10));
        regla = 'Mediano: al menos 10% del total, mínimo 5 conejos.';
        break;
      case 'intensivo':
        muestra = Math.max(10, Math.ceil(total * 0.08));
        regla = 'Intensivo: al menos 8% del total, mínimo 10 conejos.';
        break;
      default:
        muestra = Math.ceil(total * 0.1);
        regla = 'Cálculo estándar: 10% del total.';
    }

    this.muestraCalculada = muestra;
    this.muestraRegla = regla;
  }

  formularioValido(): boolean {
    return Boolean(
      this.form.nombreFinca.trim() &&
      this.form.propietario.trim() &&
      this.form.ubicacion.trim() &&
      this.form.telefono.trim() &&
      this.form.tipoProductor &&
      Number(this.form.totalConejos) > 0 &&
      this.form.fechaVisita &&
      this.form.tecnico.trim()
    );
  }

  guardar(): void {
    if (!this.formularioValido()) {
      return;
    }

    const nuevaFinca: FincaRegistro = {
      ...this.form,
      totalConejos: Number(this.form.totalConejos),
      empleados: Number(this.form.empleados)
    };

    this.fincas = [...this.fincas, nuevaFinca];

    this.form = {
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
    this.muestraCalculada = 0;
    this.muestraRegla = '';
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'pequeno':
        return 'Pequeño';
      case 'mediano':
        return 'Mediano';
      case 'intensivo':
        return 'Intensivo';
      default:
        return 'No definido';
    }
  }

  verFinca(finca: FincaRegistro): void {
    console.log('Ver finca:', finca);
  }

  evaluarFinca(finca: FincaRegistro): void {
    console.log('Evaluar finca:', finca);
    // this.router.navigate(['/evaluaciones', 'detalle', finca.nombreFinca]);
  }
}
