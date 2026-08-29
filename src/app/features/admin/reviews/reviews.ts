import { Component } from '@angular/core';
@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  template: `
    <div class="page-enter">
      <h1>Reviews</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.25rem;">Moderate customer product reviews</p>
      <div class="card" style="padding: 1.5rem;">
        <p>Reviews management will load from the API once connected.</p>
      </div>
    </div>
  `,
  styles: [`h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }`]
})
export class AdminReviewsComponent {}
