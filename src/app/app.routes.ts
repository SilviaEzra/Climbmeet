import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { EventosComponent } from './eventos/eventos.component';
import { InfoEventosComponent } from './infoeventos/infoeventos.component';
import { ProfileComponent } from './profile/profile.component';
import { InicioComponent } from './inicio/inicio.component';
import { UbicacionesComponent } from './ubicaciones/ubicaciones.component';
import { EventosCreadosComponent } from './eventos-creados/eventos-creados.component';

export const routes: Routes = [
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'eventos', component: EventosComponent, children: [
    { path: '', component: EventosCreadosComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'infoeventos/:id', component: InfoEventosComponent }
  ]},
  { path: 'ubicaciones', component: UbicacionesComponent },
  { path: '', redirectTo: '/eventos', pathMatch: 'full' },
  { path: '**', redirectTo: '/eventos', pathMatch: 'full' }
];
