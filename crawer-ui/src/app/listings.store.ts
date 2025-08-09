import { Injectable, inject, signal } from '@angular/core';
import { CrawlService, Listing } from './crawl.service';

@Injectable({ providedIn: 'root' })
export class ListingsStore {
  private readonly crawlService = inject(CrawlService);

  // Signals that keep state across navigations
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<Listing[]>([]);
  count = signal(0);

  runCrawl() {
    this.error.set(null);
    this.loading.set(true);
    this.results.set([]);
    this.count.set(0);

    this.crawlService.runCrawl().subscribe({
      next: (res) => {
        this.results.set(res.results || []);
        this.count.set(res.count || 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.error || 'Request failed');
        this.loading.set(false);
      },
    });
  }
}
