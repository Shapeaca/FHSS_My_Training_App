import { Routes } from '@angular/router';
import {
  AuthErrorPage,
  ForbiddenPage,
  NotFoundPage,
  ServerErrorPage,
} from '@fhss-web-team/frontend-utils';
import { HomePage } from './pages/home/home.page';
import { AdminPage } from './pages/admin/admin.page';
import { DefaultLayout } from './layouts/default/default.layout';
import { permissionGuard } from './utils/permission.guard';

export const routes: Routes = [
  {
    path: 'admin',
    component: DefaultLayout,
  },
  {
    path: '',
    component: DefaultLayout,
    children: [
      {
        path: 'admin',
        component: AdminPage,
        canActivate: [permissionGuard(['manage-users-full-access'])],
      },
      { path: 'server-error', component: ServerErrorPage },
      { path: 'forbidden', component: ForbiddenPage },
      { path: 'auth-error', component: AuthErrorPage },
      { path: '', pathMatch: 'full', component: HomePage },
      { path: '**', component: NotFoundPage },
    ],
  },
];
