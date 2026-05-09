import { Routes } from '@angular/router';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { Inicio } from './components/inicio/inicio';
import { LoginComponent } from './components/conejos/login/login';
import { SeleccionComponent } from './components/conejos/seleccion/seleccion';
import { DashboardComponent } from './components/conejos/dashboard/dashboard';
import { EvaluacionesComponent } from './components/conejos/evaluaciones/evaluaciones';
import { GranjasComponent } from './components/conejos/granjas/granjas';
import { ConfiguracionComponent } from './components/conejos/configuracion/configuracion';
import { ResultadosComponent } from './components/conejos/resultados/resultados';
import { RegistroComponent } from './components/conejos/evaluaciones/registro/registro';
import { ConejosComponent } from './components/conejos/evaluaciones/conejos/conejos';
import { AlimentacionComponent } from './components/conejos/evaluaciones/alimentacion/alimentacion';
import { InstalacionesComponent } from './components/conejos/evaluaciones/instalaciones/instalaciones';
import { ObservacionComponent } from './components/conejos/evaluaciones/observacion/observacion';
import { SaludComponent } from './components/conejos/evaluaciones/salud/salud';
import { GestionComponent } from './components/conejos/evaluaciones/gestion/gestion';
import { CapacitacionComponent } from './components/conejos/evaluaciones/capacitacion/capacitacion';
import { EvaluacionFinalComponent } from './components/conejos/evaluaciones/evaluacion-final/evaluacion-final';


export const routes: Routes = [

  {
    path: '',
    component: AdminPanel,
    children: [

      { path: '', redirectTo: 'inicio', pathMatch: 'full' },

      { path: 'inicio', component: Inicio },

      { path: 'login', component: LoginComponent },

      // NUEVA PAGINA DE SELECCION
      { path: 'seleccion', component: SeleccionComponent },

      { path: 'dashboard', component: DashboardComponent },

      { path: 'granjas', component: GranjasComponent },

      { path: 'configuracion', component: ConfiguracionComponent },

      { path: 'resultados', component: ResultadosComponent },

      { 
        path: 'evaluaciones', 
        component: EvaluacionesComponent,
      },
      {
        path: 'evaluaciones/registro',
        component: RegistroComponent
      },
      {
        path: 'evaluaciones/conejos',
        component: ConejosComponent
      },
      {
        path: 'evaluaciones/alimentacion',
        component: AlimentacionComponent
      },
      {
        path: 'evaluaciones/instalaciones',
        component: InstalacionesComponent
      },
      {
        path: 'evaluaciones/observacion',
        component: ObservacionComponent
      },
      {
        path: 'evaluaciones/salud',
        component: SaludComponent
      },
      {
        path: 'evaluaciones/gestion',
        component: GestionComponent
      },
      {
        path: 'evaluaciones/capacitacion',
        component: CapacitacionComponent
      },
      {
        path: 'evaluaciones/evaluacion-final',
        component: EvaluacionFinalComponent
      }
    ]
  },

  { path: '**', redirectTo: '' }

];