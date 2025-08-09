import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingsStore } from '../listings.store';
import { ListingListComponent } from './listing-list.component';

@Component({
  selector: 'ads-overview',
  standalone: true,
  imports: [CommonModule, ListingListComponent],
  template: `
    <div class="container">
      <h1>imot.bg Daily Listings</h1>
      <p>Click the button to run the crawl and display today's results.</p>

      <button (click)="runCrawl()" [disabled]="loading()">
        {{ loading() ? 'Running…' : 'Run Crawl' }}
      </button>

      <div class="card" *ngIf="error()"><strong>Error:</strong> {{ error() }}</div>

      <div class="card" *ngIf="!error()">
        <div><strong>Total:</strong> {{ count() }}</div>
        <ads-list [items]="results()"></ads-list>
      </div>
    </div>
  `,
  styles: [
    `
      .container{max-width:900px;margin:1rem auto;padding:1rem}
      .card{margin-top:1rem;padding:1rem;border:1px solid #eee;border-radius:8px}
    `,
  ],
})
export class AdsOverviewComponent {
  private readonly store = inject(ListingsStore);

  // Reuse store signals so template stays the same
  loading = this.store.loading;
  error = this.store.error;
  results = this.store.results;
  count = this.store.count;

  runCrawl() {
    this.store.runCrawl();
  }
}
