import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Listing {
  title: string;
  price: string;
  location: string;
  date: string;
  link: string;
  imgLink: string;
  description: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  apiUrl = '/crawl';
  loading = signal(false);
  error = signal<string | null>(null);
  results = signal<Listing[]>([]);
  count = signal(0);
  title = signal('crawer-ui');

  constructor(private http: HttpClient) {}

  runCrawl() {
    this.error.set(null);
    this.loading.set(true);
    this.results.set([]);
    this.count.set(0);

    const body = {
      criteria: {
        property_type: 'apartment',
        area_sqm: { min: '90', max: '170' },
        price: { min: '1', max: '400000' },
        sort_order: '5',
        keywords: ['гараж'],
        regions: [
          'Стрелбище',
          'Иван Вазов',
          'Белите Брези',
          'Манастирски ливади',
          'Кръстова вада',
          'Лозенец',
          'Хиподрума',
        ],
      },
      options: { headless: true },
    };

    this.http
      .post<{ message: string; count: number; results: Listing[] }>(
        this.apiUrl,
        body
      )
      .subscribe({
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
