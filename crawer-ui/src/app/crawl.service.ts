import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Listing {
  title: string;
  price: string;
  location: string;
  date: string;
  link: string;
  imgLink: string;
  description: string;
}

export interface CrawlResponse {
  message: string;
  count: number;
  results: Listing[];
}

@Injectable({ providedIn: 'root' })
export class CrawlService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/crawl';

  runCrawl(): Observable<CrawlResponse> {
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

    return this.http.post<CrawlResponse>(this.apiUrl, body);
  }
}
