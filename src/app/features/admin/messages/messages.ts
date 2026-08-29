import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  at: string;
  read?: boolean;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1>Contact inbox</h1>
          <p class="muted">{{ unread() }} unread · {{ messages().length }} total</p>
        </div>
        <button type="button" class="btn btn-ghost" (click)="markAllRead()" [disabled]="!messages().length">
          Mark all read
        </button>
      </div>

      @if (!messages().length) {
        <div class="card empty">
          <p>No messages yet.</p>
          <p class="muted">When customers submit the Contact form, messages appear here.</p>
        </div>
      } @else {
        <div class="list">
          @for (m of messages(); track m.at + m.email; let i = $index) {
            <article class="card msg" [class.unread]="!m.read" (click)="open(i)">
              <div class="msg-top">
                <strong>{{ m.name }}</strong>
                <span class="subj">{{ m.subject }}</span>
                <time>{{ m.at | date: 'medium' }}</time>
              </div>
              <p class="preview">{{ m.message }}</p>
              <div class="meta">
                <a [href]="'mailto:' + m.email" (click)="$event.stopPropagation()">{{ m.email }}</a>
                @if (m.phone) {
                  <span>·</span>
                  <a [href]="'tel:' + m.phone" (click)="$event.stopPropagation()">{{ m.phone }}</a>
                }
                <button type="button" class="link danger" (click)="remove(i); $event.stopPropagation()">Delete</button>
              </div>
              @if (selected() === i) {
                <div class="full">
                  <p>{{ m.message }}</p>
                  <a class="btn btn-primary btn-sm" [href]="replyMailto(m)" (click)="$event.stopPropagation()">Reply by email</a>
                  @if (m.phone) {
                    <a class="btn btn-ghost btn-sm" [href]="waReply(m)" target="_blank" rel="noopener" (click)="$event.stopPropagation()">WhatsApp</a>
                  }
                </div>
              }
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    h1 { font-size: 1.6rem; margin: 0; }
    .muted { color: var(--color-text-muted, #6b7280); font-size: 0.9rem; margin-top: 0.25rem; }
    .empty { padding: 2.5rem; text-align: center; }
    .list { display: flex; flex-direction: column; gap: 0.75rem; }
    .msg { padding: 1rem 1.25rem; cursor: pointer; transition: border-color 0.2s; }
    .msg.unread { border-left: 3px solid var(--color-primary, #e11d48); background: #fffafb; }
    .msg-top { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; margin-bottom: 0.35rem; }
    .subj { font-size: 0.85rem; font-weight: 600; color: var(--color-primary, #e11d48); }
    time { margin-left: auto; font-size: 0.8rem; color: var(--color-text-muted, #9ca3af); }
    .preview { font-size: 0.9rem; color: var(--color-text-muted, #6b7280); margin: 0;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.5rem; font-size: 0.85rem; }
    .meta a { color: var(--color-primary, #e11d48); }
    .link { background: none; border: none; cursor: pointer; font-size: 0.85rem; color: var(--color-text-muted, #6b7280); }
    .link.danger:hover { color: #dc2626; }
    .full { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border, #eee); }
    .full p { white-space: pre-wrap; margin-bottom: 1rem; line-height: 1.55; }
    .btn-sm { padding: 0.4rem 0.9rem; font-size: 0.85rem; margin-right: 0.5rem; }
  `]
})
export class AdminMessagesComponent implements OnInit {
  private readonly KEY = 'luxe_contact_messages';
  messages = signal<ContactMessage[]>([]);
  selected = signal<number | null>(null);

  ngOnInit(): void { this.reload(); }

  unread(): number {
    return this.messages().filter(m => !m.read).length;
  }

  private reload(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      const list = raw ? JSON.parse(raw) as ContactMessage[] : [];
      this.messages.set(Array.isArray(list) ? list : []);
    } catch { this.messages.set([]); }
  }

  private save(list: ContactMessage[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(list));
    this.messages.set(list);
  }

  open(i: number): void {
    this.selected.update(s => s === i ? null : i);
    const list = [...this.messages()];
    if (list[i] && !list[i].read) {
      list[i] = { ...list[i], read: true };
      this.save(list);
    }
  }

  markAllRead(): void {
    this.save(this.messages().map(m => ({ ...m, read: true })));
  }

  remove(i: number): void {
    if (!confirm('Delete this message?')) return;
    this.save(this.messages().filter((_, idx) => idx !== i));
    this.selected.set(null);
  }

  replyMailto(m: ContactMessage): string {
    return `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`;
  }

  waReply(m: ContactMessage): string {
    const phone = (m.phone || '').replace(/\D/g, '');
    const local = phone.startsWith('0') ? '92' + phone.slice(1) : phone;
    return `https://wa.me/${local}?text=${encodeURIComponent('Hi ' + m.name + ', regarding your message about "' + m.subject + '"…')}`;
  }
}
