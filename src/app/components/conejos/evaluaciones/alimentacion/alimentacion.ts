import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-alimentacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './alimentacion.html',
  styleUrls: ['./alimentacion.scss']
})
export class AlimentacionComponent {

  opcionesSeleccionadas: Record<string, string> = {};
  tiposAlimento: Set<string> = new Set();

  constructor(private cdr: ChangeDetectorRef) {}

  seleccionar(grupo: string, valor: string): void {
    this.opcionesSeleccionadas[grupo] = valor;
  }

  toggleAlimento(tipo: string): void {
    // Crear nuevo Set para que Angular detecte el cambio
    const nuevo = new Set(this.tiposAlimento);
    if (nuevo.has(tipo)) {
      nuevo.delete(tipo);
    } else {
      nuevo.add(tipo);
    }
    this.tiposAlimento = nuevo;
    this.cdr.markForCheck();
  }

}