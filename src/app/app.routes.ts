import { Routes } from '@angular/router';
import { PhotoCollageComponent } from './photo-collage/photo-collage.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: AppComponent },
  { path: 'collage', component: PhotoCollageComponent }
];
