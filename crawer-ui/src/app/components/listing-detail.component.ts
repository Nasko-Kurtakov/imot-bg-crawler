import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Listing } from '../crawl.service';

@Component({
  selector: 'ad-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (listing()) {
    <div class="detail">
      <button class="back" (click)="goBack()">← Back</button>
      <h2>{{ listing()!.title }}</h2>
      <div class="meta">
        {{ listing()!.location }} • {{ listing()!.price }} •
        {{ listing()!.date }}
      </div>
      @if (listing()?.imgLink) {
      <img [src]="listing()?.imgLink" alt="Listing image" />
      }
      <p class="desc">{{ listing()?.description }}</p>
      <p>
        <a class="open" [href]="listing()?.link" target="_blank" rel="noopener"
          >Open on imot.bg</a
        >
      </p>
    </div>
    } @else {
    <div class="missing">
      Listing data is not available. Please navigate from the list.
    </div>
    }
  `,
  styles: [
    `
      .detail {
        max-width: 900px;
        margin: 1rem auto;
        padding: 1rem;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
      }
      .back {
        margin-bottom: 0.5rem;
      }
      .meta {
        color: #666;
        margin: 0.5rem 0;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 0.5rem 0;
      }
      .open {
        display: inline-block;
        margin-top: 0.5rem;
      }
      .missing {
        padding: 1rem;
      }
    `,
  ],
})
export class ListingDetailComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  listing = computed<Listing | null>(() => {
    const st =
      (this.router.getCurrentNavigation()?.extras.state as any) ??
      history.state;
    return st && st.listing ? (st.listing as Listing) : null;
  });

  goBack() {
    this.location.back();
  }
}
