import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DecimalPipe,
    NavbarComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <main class="page-enter">
      <div class="container">

        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/cart">Cart</a>
          <span>/</span>
          <span>Checkout</span>
        </nav>

        <h1>Checkout</h1>

        @if (cart.itemCount() === 0 && !orderPlaced()) {

          <div class="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add some accessories before checking out.</p>

            <a routerLink="/shop" class="btn btn-primary">
              Start Shopping
            </a>
          </div>

        } @else if (orderPlaced()) {

          <div class="success-card card">

            <div class="success-icon">✓</div>

            <h2>Order Placed Successfully!</h2>

            <p>Thank you for your order.</p>

            <p class="order-num">
              Order #{{ orderNumber() }}
            </p>

            <p class="muted">
              Estimated delivery: 2–5 business days
            </p>

            <p class="cancel-note">
              You can cancel this order within 24 hours if it has not entered shipment processing.
            </p>

            <div class="success-actions">

              <a
                routerLink="/account"
                class="btn btn-primary">
                View Order
              </a>

              <a
                class="btn btn-wa"
                [href]="whatsAppOrderLink()"
                target="_blank"
                rel="noopener">
                Share on WhatsApp
              </a>

              <a
                routerLink="/shop"
                class="btn btn-outline">
                Continue Shopping
              </a>

            </div>

          </div>

        } @else {

          <!-- Progress -->

          <div class="progress">

            @for (s of steps; track s; let i = $index) {

              <div
                class="step"
                [class.active]="step() === i"
                [class.done]="step() > i">

                <span class="num">
                  {{ i + 1 }}
                </span>

                <span class="label">
                  {{ s }}
                </span>

              </div>

              @if (i < steps.length - 1) {

                <div
                  class="line"
                  [class.done]="step() > i">
                </div>

              }

            }

          </div>

          <div class="checkout-layout">

            <!-- FORM -->

            <div class="form-panel">

              <!-- STEP 0 -->

              @if (step() === 0) {

                <form
                  [formGroup]="infoForm"
                  (ngSubmit)="nextStep()">

                  <h2>Customer Information</h2>

                  <div class="form-group">

                    <label class="form-label">
                      Full Name *
                    </label>

                    <input
                      class="form-control"
                      formControlName="fullName"
                      placeholder="Your full name" />

                  </div>

                  <div class="form-group">

                    <label class="form-label">
                      Email *
                    </label>

                    <input
                      type="email"
                      class="form-control"
                      formControlName="email"
                      placeholder="you@example.com" />

                  </div>

                  <div class="form-group">

                    <label class="form-label">
                      Phone Number *
                    </label>

                    <input
                      type="tel"
                      class="form-control"
                      formControlName="phone"
                      placeholder="03XX-XXXXXXX" />

                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="infoForm.invalid">

                    Continue to Delivery

                  </button>

                </form>

              }

              <!-- STEP 1 -->

              @if (step() === 1) {

                <form
                  [formGroup]="deliveryForm"
                  (ngSubmit)="nextStep()">

                  <h2>Delivery Information</h2>

                  <div class="form-group">

                    <label class="form-label">
                      Complete Address *
                    </label>

                    <textarea
                      class="form-control"
                      formControlName="address"
                      rows="3"
                      placeholder="House / street / landmark">
                    </textarea>

                  </div>

                  <div class="form-row">

                    <div class="form-group">

                      <label class="form-label">
                        City *
                      </label>

                      <input
                        class="form-control"
                        formControlName="city"
                        placeholder="City" />

                    </div>

                    <div class="form-group">

                      <label class="form-label">
                        Area
                      </label>

                      <input
                        class="form-control"
                        formControlName="area"
                        placeholder="Area / locality" />

                    </div>

                  </div>

                  <div class="form-group">

                    <label class="form-label">
                      Postal Code
                    </label>

                    <input
                      class="form-control"
                      formControlName="postalCode"
                      placeholder="Postal code" />

                  </div>

                  <div class="form-group">

                    <label class="form-label">
                      Delivery Instructions (optional)
                    </label>

                    <textarea
                      class="form-control"
                      formControlName="instructions"
                      rows="2"
                      placeholder="Gate code, preferred time...">
                    </textarea>

                  </div>

                  <div class="btn-row">

                    <button
                      type="button"
                      class="btn btn-outline"
                      (click)="prevStep()">

                      Back

                    </button>

                    <button
                      type="submit"
                      class="btn btn-primary"
                      [disabled]="deliveryForm.invalid">

                      Continue to Payment

                    </button>

                  </div>

                </form>

              }

              <!-- STEP 2 -->

              @if (step() === 2) {

                <div>

                  <h2>Payment Method</h2>

                  <div class="payment-options">

                    <label class="payment-card active">

                      <input
                        type="radio"
                        name="payment"
                        value="CashOnDelivery"
                        checked />

                      <div>

                        <strong>
                          Cash on Delivery
                        </strong>

                        <p>
                          Pay when your order arrives
                        </p>

                      </div>

                    </label>

                  </div>

                  <p
                    class="muted"
                    style="margin: 1rem 0 1.5rem; font-size: 0.9rem;">

                    Online payment methods
                    (JazzCash, Easypaisa, etc.)
                    will be available soon.

                  </p>

                  <div class="btn-row">

                    <button
                      type="button"
                      class="btn btn-outline"
                      (click)="prevStep()">

                      Back

                    </button>

                    <button
                      type="button"
                      class="btn btn-primary btn-lg"
                      [disabled]="placing()"
                      (click)="placeOrder()">

                      {{ placing()
                        ? 'Placing Order...'
                        : 'Place Order'
                      }}

                    </button>

                  </div>

                </div>

              }

            </div>

            <!-- ORDER SUMMARY -->

            <aside class="summary card">

              <h3>Order Summary</h3>

              <div class="summary-items">

                @for (
                  item of cart.cartItems();
                  track item.productId
                ) {

                  <div class="sum-item">

                    <img
                      [src]="item.productImage"
                      [alt]="item.productName" />

                    <div>

                      <p class="name">
                        {{ item.productName }}
                      </p>

                      <p class="qty">
                        Qty: {{ item.quantity }}
                      </p>

                    </div>

                    <span class="price">
                      Rs. {{ item.subtotal | number }}
                    </span>

                  </div>

                }

              </div>

              <div class="summary-row">

                <span>Subtotal</span>

                <span>
                  Rs. {{ cart.subtotal() | number }}
                </span>

              </div>

              <div class="summary-row">

                <span>Delivery</span>

                <span>

                  @if (
                    cart.subtotal() >= cart.freeDeliveryThreshold()
                  ) {

                    Free

                  } @else {

                    Rs. {{ cart.deliveryCharges() | number }}

                  }

                </span>

              </div>

              @if (cart.discount() > 0) {

                <div
                  class="summary-row"
                  style="color: var(--color-success);">

                  <span>Discount</span>

                  <span>
                    − Rs. {{ cart.discount() | number }}
                  </span>

                </div>

              }

              <div class="summary-row total">

                <span>Total</span>

                <span>
                  Rs. {{ cart.total() | number }}
                </span>

              </div>

            </aside>

          </div>

        }

      </div>
    </main>
  `,

  styles: [`
    .breadcrumb {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      padding: 1.5rem 0 0.5rem;
      display: flex;
      gap: 0.5rem;
    }

    .breadcrumb a {
      color: var(--color-text-muted);
    }

    h1 {
      font-size: 1.9rem;
      margin-bottom: 1.5rem;
    }

    .progress {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .step .num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
      background: var(--color-border);
      color: var(--color-text-muted);
    }

    .step.active .num,
    .step.done .num {
      background: var(--color-primary);
      color: white;
    }

    .step .label {
      font-size: 0.9rem;
      color: var(--color-text-muted);
    }

    .step.active .label {
      color: var(--color-text);
      font-weight: 500;
    }

    .line {
      width: 40px;
      height: 2px;
      background: var(--color-border);
      margin: 0 0.5rem;
    }

    .line.done {
      background: var(--color-primary);
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      padding-bottom: 4rem;
      align-items: start;
    }

    .form-panel {
      background: white;
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-card);
    }

    .form-panel h2 {
      font-size: 1.25rem;
      margin-bottom: 1.25rem;
      font-family: var(--font-body);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .payment-card {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      padding: 1rem 1.25rem;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    .payment-card.active {
      border-color: var(--color-primary);
      background: var(--color-blush);
    }

    .payment-card strong {
      display: block;
      margin-bottom: 0.2rem;
    }

    .payment-card p {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    .summary {
      padding: 1.5rem;
      position: sticky;
      top: 88px;
    }

    .summary h3 {
      font-size: 1.1rem;
      font-family: var(--font-body);
      margin-bottom: 1rem;
    }

    .summary-items {
      margin-bottom: 1rem;
      max-height: 240px;
      overflow-y: auto;
    }

    .sum-item {
      display: grid;
      grid-template-columns: 48px 1fr auto;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }

    .sum-item img {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }

    .sum-item .name {
      font-weight: 500;
      line-height: 1.3;
    }

    .sum-item .qty {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.6rem;
      font-size: 0.95rem;
    }

    .summary-row.total {
      font-weight: 600;
      font-size: 1.1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border);
      margin-top: 0.5rem;
    }

    .success-card {
      max-width: 520px;
      margin: 2rem auto 4rem;
      text-align: center;
      padding: 3rem 2rem;
    }

    .success-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--color-success);
      color: white;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    .success-card h2 {
      margin-bottom: 0.5rem;
    }

    .order-num {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 1rem 0 0.5rem;
    }

    .muted {
      color: var(--color-text-muted);
    }

    .cancel-note {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 1rem 0 1.5rem;
    }

    .success-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-wa {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #25D366;
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 0.65rem 1.25rem;
      font-weight: 600;
      text-decoration: none;
    }

    .btn-wa:hover {
      filter: brightness(1.05);
      color: #fff;
    }

    @media (max-width: 800px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }

      .summary {
        position: static;
        order: -1;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .step .label {
        display: none;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  cart = inject(CartService);

  steps = [
    'Information',
    'Delivery',
    'Payment'
  ];

  step = signal(0);
  placing = signal(false);
  orderPlaced = signal(false);
  orderNumber = signal('');

  private lastOrderSummary = '';

  /**
   * Change this to your actual WhatsApp shop number.
   * Country code without +.
   */
  private storeWhatsApp = '923001234567';

  infoForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    phone: ['', Validators.required]
  });

  deliveryForm = this.fb.nonNullable.group({
    address: ['', Validators.required],
    city: ['', Validators.required],
    area: [''],
    postalCode: [''],
    instructions: ['']
  });

  ngOnInit(): void {

    const user = this.auth.user();

    if (user) {

      this.infoForm.patchValue({
        fullName: user.name,
        email: user.email,
        phone: user.phone || ''
      });

    }

  }

  nextStep(): void {

    if (
      this.step() === 0 &&
      this.infoForm.invalid
    ) {
      this.infoForm.markAllAsTouched();
      return;
    }

    if (
      this.step() === 1 &&
      this.deliveryForm.invalid
    ) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    this.step.update(
      current => Math.min(current + 1, 2)
    );
  }

  prevStep(): void {

    this.step.update(
      current => Math.max(current - 1, 0)
    );
  }

  placeOrder(): void {

    if (this.cart.itemCount() === 0) {
      return;
    }

    this.placing.set(true);

    const items = this.cart.cartItems();

    /*
     * CartItem uses productName,
     * not name.
     */
    const lines = items
      .map(item =>
        `• ${item.productName} x${item.quantity}`
      )
      .join('\n');

    const total = this.cart.total();

    const info = this.infoForm.getRawValue();
    const delivery = this.deliveryForm.getRawValue();

    /*
     * Simulated backend order creation.
     * Replace this with the real API call later.
     */
    setTimeout(() => {

      const num =
        'ORD-' +
        String(
          Math.floor(
            100000 + Math.random() * 900000
          )
        );

      this.orderNumber.set(num);

      this.lastOrderSummary =
        `New order ${num}\n` +
        `Name: ${info.fullName}\n` +
        `Phone: ${info.phone}\n` +
        `Address: ${delivery.address}, ${delivery.city}\n\n` +
        `${lines}\n\n` +
        `Total: Rs. ${total}`;

      this.orderPlaced.set(true);

      this.cart.clear();

      this.placing.set(false);

      this.toast.success(
        'Order placed successfully!'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    }, 900);
  }

  whatsAppOrderLink(): string {

    const text =
      this.lastOrderSummary ||
      `Order ${this.orderNumber()}`;

    return (
      `https://wa.me/${this.storeWhatsApp}` +
      `?text=${encodeURIComponent(text)}`
    );
  }
}