import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toast-container">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [attr.data-type]="t.type">
          <span>{{ t.message }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" style="border:none;background:transparent;cursor:pointer;margin-left:auto;">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast[data-type="success"] { border-left: 4px solid var(--color-success); }
    .toast[data-type="error"] { border-left: 4px solid var(--color-danger); }
    .toast[data-type="info"] { border-left: 4px solid var(--color-info); }
    .toast[data-type="warning"] { border-left: 4px solid var(--color-warning); }
  `]
})
export class App {
  constructor(public toast: ToastService) {}
}
