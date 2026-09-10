import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-vertrieb-bestand',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Vertrieb"></app-work-in-progress>`
})
export class VertriebBestandComponent {}
