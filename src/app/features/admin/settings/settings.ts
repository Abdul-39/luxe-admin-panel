import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-enter">
      <h1>Store Settings</h1>
      <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Configure delivery and cancellation rules</p>
      <div class="card" style="padding: 1.5rem; max-width: 480px;">
        <div class="form-group">
          <label class="form-label">Default Delivery Fee (Rs.)</label>
          <input type="number" class="form-control" [(ngModel)]="deliveryFee" />
        </div>
        <div class="form-group">
          <label class="form-label">Free Delivery Threshold (Rs.)</label>
          <input type="number" class="form-control" [(ngModel)]="freeThreshold" />
        </div>
        <div class="form-group">
          <label class="form-label">Cancellation Window (hours)</label>
          <input type="number" class="form-control" [(ngModel)]="cancelHours" />
        </div>
        <button type="button" class="btn btn-primary" (click)="save()">Save Settings</button>
      </div>
    </div>
  `,
  styles: [`h1 { font-size: 1.6rem; margin-bottom: 0.2rem; }`]
})
export class AdminSettingsComponent {
  deliveryFee = 200;
  freeThreshold = 3000;
  cancelHours = 24;
  save() { alert('Settings saved (demo)'); }
}
