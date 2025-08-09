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

export interface Criteria {
  property_type?: string;
  area_sqm?: { min?: string; max?: string };
  price?: { min?: string; max?: string };
  sort_order?: string;
  keywords?: string[];
  regions?: string[];
}

@Injectable({ providedIn: 'root' })
export class CrawlService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/crawl';

  runCrawl(criteria: Criteria): Observable<CrawlResponse> {
    const body = { criteria, options: { headless: true } };
    return this.http.post<CrawlResponse>(this.apiUrl, body);
  }
}
