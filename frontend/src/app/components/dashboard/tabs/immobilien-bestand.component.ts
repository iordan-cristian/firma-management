import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-immobilien-bestand',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Immobilien"></app-work-in-progress>`
})
export class ImmobilienBestandComponent {}
