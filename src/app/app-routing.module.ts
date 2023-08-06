import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./modules/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'results',
    loadChildren: () => import('./modules/results/results.module').then(m => m.ResultsModule)
  }
];

export class NavigationErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        console.error('Navigation Error:', error);
    }
}

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
      { provide: ErrorHandler, useClass: NavigationErrorHandler }
  ]
})
export class AppRoutingModule { }
