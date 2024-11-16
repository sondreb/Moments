import { Routes } from '@angular/router';
import { PhotoCollageComponent } from './photo-collage/photo-collage.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'collage', component: PhotoCollageComponent }
];
