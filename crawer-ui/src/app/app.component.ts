import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrawlService, Listing } from './crawl.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly crawlService = inject(CrawlService);
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<Listing[]>([]);
  count = signal(0);
  title = signal('crawer-ui');

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
