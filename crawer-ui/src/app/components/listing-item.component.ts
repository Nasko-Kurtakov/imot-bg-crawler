import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Listing } from '../crawl.service';

@Component({
  selector: 'ad-listing-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a class="item" [routerLink]="['/listing']" [state]="{ listing }">
      <div class="row">
        <img
          *ngIf="listing.imgLink"
          class="thumb"
          [src]="listing.imgLink"
          alt="Listing image"
          loading="lazy"
        />
        <div class="content">
          <div class="title">{{ listing.title }}</div>
          <div class="meta">
            {{ listing.location }} • {{ listing.price }} EUR •
            {{ listing.date }}
          </div>
          <div class="desc">
            {{ listing.description | slice : 0 : 40 }}
            @if(listing.description.length > 40){ ... }
          </div>
          <div class="actions">
            <a
              class="ext"
              [href]="listing.link"
              target="_blank"
              rel="noopener"
              (click)="$event.stopPropagation()"
              >Open on imot.bg ↗</a
            >
          </div>
        </div>
      </div>
    </a>
  `,
  styles: [
    `
      .item {
        display: block;
        padding: 0.75rem;
        border: 1px solid #eee;
        border-radius: 8px;
        text-decoration: none;
        color: inherit;
      }
      .row {
        display: grid;
        grid-template-columns: 96px 1fr;
        gap: 0.75rem;
        align-items: start;
      }
      .thumb {
        width: 96px;
        height: 72px;
        object-fit: cover;
        border-radius: 6px;
        background: #f5f5f5;
      }
      .title {
        font-weight: 600;
      }
      .meta {
        color: #666;
        font-size: 0.9rem;
      }
      .desc {
        margin-top: 0.5rem;
      }
      .actions {
        margin-top: 0.5rem;
      }
      .ext {
        color: #2563eb;
        text-decoration: underline;
      }
    `,
  ],
})
export class ListingItemComponent {
  @Input({ required: true }) listing!: Listing;
}
