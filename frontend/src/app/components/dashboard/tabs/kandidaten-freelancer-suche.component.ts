import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-kandidaten-freelancer-suche',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Kandidaten (Freelancer) - Suche"></app-work-in-progress>`
})
export class KandidatenFreelancerSucheComponent {}
