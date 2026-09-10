import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-work-in-progress',
  standalone: true,
  template: `
    <div class="wip">
      <h2>{{ label }}</h2>
      <p>Work in progress</p>
    </div>
  `,
  styles: [`
    .wip {
      min-height: 40vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #555;
    }
    h2 { font-size: 24px; margin: 0; color: #1f2a44; }
    p { font-size: 16px; margin-top: 12px; }
  `]
})
export class WorkInProgressComponent {
  @Input() label = '';
}
