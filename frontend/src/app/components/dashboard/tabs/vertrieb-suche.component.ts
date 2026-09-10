import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-vertrieb-suche',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Vertrieb - Suche"></app-work-in-progress>`
})
export class VertriebSucheComponent {}
