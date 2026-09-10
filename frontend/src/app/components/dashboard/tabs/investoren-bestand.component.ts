import { Component } from '@angular/core';
import { WorkInProgressComponent } from '../work-in-progress.component';

@Component({
  selector: 'app-investoren-bestand',
  standalone: true,
  imports: [WorkInProgressComponent],
  template: `<app-work-in-progress label="Investoren"></app-work-in-progress>`
})
export class InvestorenBestandComponent {}
