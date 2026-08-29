import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../layout/navbar/navbar';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  template: `
    <app-navbar />

    <main class="page-enter">
      <div class="container">

        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <span>About Us</span>
        </nav>

        <section class="about-hero">
          <div class="about-content">
            <span class="eyebrow">ABOUT LUXE</span>

            <h1>
              Accessories That
              <span>Complete Your Style</span>
            </h1>

            <p>
              Welcome to Luxe Mobile Accessories — your destination for
              stylish, reliable, and affordable mobile accessories.
            </p>

            <p>
              We believe your phone is more than just a device. It is part
              of your everyday style, and the right accessory can make it
              even better.
            </p>

            <a routerLink="/shop" class="btn btn-primary">
              Explore Our Collection
            </a>
          </div>

          <div class="about-card card">
            <div class="about-icon">✦</div>
            <h2>Why Luxe?</h2>

            <p>
              We carefully select products that combine quality, design,
              functionality, and value.
            </p>
          </div>
        </section>

        <section class="values-section">
          <div class="section-heading">
            <span class="eyebrow">WHAT WE OFFER</span>
            <h2>Made for Your Everyday Life</h2>
            <p>
              Everything you need to protect, power, and personalize
              your mobile devices.
            </p>
          </div>

          <div class="values-grid">

            <div class="value-card card">
              <div class="value-icon">🛡️</div>
              <h3>Quality Products</h3>
              <p>
                We focus on accessories that provide dependable quality
                and everyday performance.
              </p>
            </div>

            <div class="value-card card">
              <div class="value-icon">✨</div>
              <h3>Stylish Designs</h3>
              <p>
                Modern designs that help your mobile devices look as good
                as they perform.
              </p>
            </div>

            <div class="value-card card">
              <div class="value-icon">💰</div>
              <h3>Affordable Prices</h3>
              <p>
                Great accessories at prices that give you excellent value
                for your money.
              </p>
            </div>

            <div class="value-card card">
              <div class="value-icon">❤️</div>
              <h3>Customer First</h3>
              <p>
                Your shopping experience matters to us. We aim to make
                every order simple and enjoyable.
              </p>
            </div>

          </div>
        </section>

        <section class="story-section">
          <div class="story-card card">

            <span class="eyebrow">OUR STORY</span>

            <h2>Built Around Mobile Lifestyle</h2>

            <p>
              Luxe Mobile Accessories was created to make it easier for
              customers to find useful and stylish mobile accessories
              without compromising on quality.
            </p>

            <p>
              From protective cases and charging accessories to everyday
              mobile essentials, our collection is designed to meet the
              needs of modern smartphone users.
            </p>

            <a routerLink="/shop" class="btn btn-outline">
              Shop Now
            </a>

          </div>
        </section>

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

    .about-hero {
      display: grid;
      grid-template-columns: 1.4fr 0.8fr;
      gap: 3rem;
      align-items: center;
      padding: 4rem 0;
    }

    .eyebrow {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--color-primary);
      margin-bottom: 0.75rem;
    }

    .about-content h1 {
      font-size: clamp(2.2rem, 5vw, 4rem);
      line-height: 1.05;
      margin-bottom: 1.5rem;
    }

    .about-content h1 span {
      display: block;
      color: var(--color-primary);
    }

    .about-content p {
      max-width: 650px;
      color: var(--color-text-muted);
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .about-card {
      padding: 2.5rem;
      text-align: center;
    }

    .about-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-blush);
      color: var(--color-primary);
      font-size: 2rem;
    }

    .about-card h2 {
      margin-bottom: 0.75rem;
    }

    .about-card p {
      color: var(--color-text-muted);
      line-height: 1.7;
    }

    .values-section {
      padding: 3rem 0 4rem;
    }

    .section-heading {
      text-align: center;
      max-width: 650px;
      margin: 0 auto 2.5rem;
    }

    .section-heading h2 {
      font-size: 2rem;
      margin-bottom: 0.75rem;
    }

    .section-heading p {
      color: var(--color-text-muted);
      line-height: 1.7;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .value-card {
      padding: 1.75rem;
      text-align: center;
    }

    .value-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .value-card h3 {
      margin-bottom: 0.75rem;
    }

    .value-card p {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      line-height: 1.7;
    }

    .story-section {
      padding: 1rem 0 5rem;
    }

    .story-card {
      max-width: 850px;
      margin: auto;
      padding: 3rem;
      text-align: center;
    }

    .story-card h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .story-card p {
      color: var(--color-text-muted);
      line-height: 1.8;
      margin-bottom: 1rem;
    }

    .story-card .btn {
      margin-top: 1rem;
    }

    @media (max-width: 900px) {
      .about-hero {
        grid-template-columns: 1fr;
        padding: 2.5rem 0;
      }

      .values-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .values-grid {
        grid-template-columns: 1fr;
      }

      .story-card {
        padding: 2rem 1.25rem;
      }

      .about-content h1 {
        font-size: 2.4rem;
      }
    }
  `]
})
export class AboutComponent {}