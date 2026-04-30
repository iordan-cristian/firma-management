import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  template: `
    <div class="landing">
      <h1>Work in progress</h1>
      <p>Dashboards will live here in a future iteration.</p>
    </div>
  `,
  styles: [`
    .landing {
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #555;
    }
    h1 { font-size: 42px; margin: 0; color: #1f2a44; }
    p { font-size: 16px; margin-top: 12px; }
  `]
})
export class LandingComponent {}
