import { Routes } from '@angular/router';
import { AdminPanel } from './components/admin-panel/admin-panel';
//import { Login } from './login/login';
import { Inicio } from './components/inicio/inicio';

export const routes: Routes = [
    { path: '**', redirectTo: 'Bienestar-animal', pathMatch: 'full' },
    {
        path:'Bienestar-animal',
        component:AdminPanel,
        
        children:[
            {path:'',redirectTo:'inicio',pathMatch:'full'},
            { path: 'inicio', component: Inicio },

        ]
    }


];

