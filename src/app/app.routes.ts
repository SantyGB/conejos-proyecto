import { Routes } from '@angular/router';

// Layout
import { AdminPanel } from './components/admin-panel/admin-panel';

// Páginas
import { Inicio } from './components/inicio/inicio';
import { LoginComponent } from './components/conejos/login/login';

// NUEVO
import { SeleccionComponent } from './components/conejos/seleccion/seleccion';

// Tus vistas
import { DashboardComponent } from './components/conejos/dashboard/dashboard';
import { EvaluacionesComponent } from './components/conejos/evaluaciones/evaluaciones';
import { GranjasComponent } from './components/conejos/granjas/granjas';
import { ConfiguracionComponent } from './components/conejos/configuracion/configuracion';
import { ResultadosComponent } from './components/conejos/resultados/resultados';

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
        children: [

          // futuras rutas

          // { path: 'registro', component: RegistroComponent }

        ]
      }

    ]
  },

  { path: '**', redirectTo: '' }

];