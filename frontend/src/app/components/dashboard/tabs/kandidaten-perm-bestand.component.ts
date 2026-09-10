import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-kandidaten-perm-bestand',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Kandidaten (Perm)"></app-work-in-progress>`
})
export class KandidatenPermBestandComponent {}
