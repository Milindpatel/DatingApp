import { Component, signal } from '@angular/core';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-home',
  imports: [RegisterComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  readonly registerMode = signal(false);
}
