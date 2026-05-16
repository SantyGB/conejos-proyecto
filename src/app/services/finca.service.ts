import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FincaService {

  fincaSeleccionada: any = null;

  setFinca(finca: any) {
    this.fincaSeleccionada = finca;
  }

  getFinca() {
    return this.fincaSeleccionada;
  }

}