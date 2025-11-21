import { Routes } from '@angular/router';
import { AdminComponent } from './modules/layout/admin';
import { EmptyComponent } from './modules/layout/empty';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: EmptyComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () => import('./modules/pages/auth/login/login.component')
      },
    ]
  },
  {
    path: 'principal',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'login' }
];
