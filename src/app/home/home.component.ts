import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="fullscreen-container">
      <img src="/icons/icon-1024x1024.png" alt="Moments Logo" class="logo" />
      <div class="content">
        <h1>Welcome to Moments</h1>
        <button [routerLink]="['/collage']" class="start-button">
          Create Collage
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
