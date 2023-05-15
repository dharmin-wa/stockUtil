import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: '/dashboard', pathMatch: 'full'
  },
  { path: "dashboard", loadChildren: () => import('./dashboard/component/dashboard.module').then((m) => m.DashboardModule), },
  { path: "stock", loadChildren: () => import('./stock/component/stock.module').then((m) => m.StockModule), }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
