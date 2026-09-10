import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-kandidaten-freelancer-bestand',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Kandidaten (Freelancer)"></app-work-in-progress>`
})
export class KandidatenFreelancerBestandComponent {}
