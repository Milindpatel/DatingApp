import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  imports: [NavComponent, RouterOutlet],
  template: `
    <app-nav />
    <router-outlet />
  `,
})
export class App {}
