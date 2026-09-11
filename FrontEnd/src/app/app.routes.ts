import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/modifier-profile/profile.component';
import { usersGuard, adminGuard } from './users.guard';
import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/userslist/user.component';
import { ChangerMotpasseComponent } from './pages/profile/changer-motpasse/changer-motpasse.component';
import { GroupworkspaceComponent } from './pages/groupworkspace/groupworkspace.component';
import { PlanificationComponent } from './pages/plan';
import { EmailVerificationComponent } from './pages/EmailVerification/email-verification.component';
import { HistoryComponent } from './pages/History/history.component';
import { VerifyCartoComponent } from './pages/CartoVerification/carto-verif.component';

export const routes: Routes = [
  { path: 'navbar', component: NavComponent, canActivate: [usersGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [usersGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [usersGuard] },
  {
    path: 'admin/update/:id',
    component: UserComponent,
    canActivate: [adminGuard],
  },
  { path: 'users', component: UserComponent, canActivate: [adminGuard] },
  { path: 'change-password/:id', component: ChangerMotpasseComponent },
  {
    path: 'groupworkspace',
    component: GroupworkspaceComponent,
    canActivate: [usersGuard],
  },
  {
    path: 'plan',
    component: PlanificationComponent,
    canActivate: [usersGuard],
  },
  {
    path: 'verify',
    component: EmailVerificationComponent,
  },
  {
    path: 'history',
    component:   HistoryComponent,
  },
  {
    path: 'verify-cartos',
    component: VerifyCartoComponent,
  },
  { path: '**', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
