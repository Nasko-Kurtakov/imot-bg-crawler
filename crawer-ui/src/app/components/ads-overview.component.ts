import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingsStore } from '../listings.store';
import { ListingListComponent } from './listing-list.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ads-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ListingListComponent,
  ],
  template: `
    <div class="container">
      <h1>imot.bg Daily Listings</h1>
      <p>Fill criteria and submit to run the crawl.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>Type</mat-label>
            <input
              matInput
              formControlName="property_type"
              placeholder="apartment"
            />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Sort</mat-label>
            <input matInput formControlName="sort_order" placeholder="5" />
          </mat-form-field>
        </div>
        <div class="row">
          <mat-form-field appearance="fill">
            <mat-label>Price min</mat-label>
            <input
              matInput
              formControlName="price_min"
              type="number"
              placeholder="1"
            />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Price max</mat-label>
            <input
              matInput
              formControlName="price_max"
              type="number"
              placeholder="400000"
            />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Area min</mat-label>
            <input
              matInput
              formControlName="area_min"
              type="number"
              placeholder="90"
            />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Area max</mat-label>
            <input
              matInput
              formControlName="area_max"
              type="number"
              placeholder="170"
            />
          </mat-form-field>
        </div>
        <div class="row grow">
          <mat-form-field class="full" appearance="fill">
            <mat-label>Keywords (comma separated)</mat-label>
            <input
              matInput
              formControlName="keywords"
              placeholder="гараж, юг"
            />
          </mat-form-field>
        </div>
        <div class="row grow">
          <mat-form-field class="full" appearance="fill">
            <mat-label>Regions</mat-label>
            <mat-select formControlName="regions" multiple>
              @for (r of regionOptions; track r) {
              <mat-option [value]="r">{{ r }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="loading()"
        >
          {{ loading() ? 'Running…' : 'Run Crawl' }}
        </button>
      </form>
      @if (error()) {
      <div class="card"><strong>Error:</strong> {{ error() }}</div>
      } @if (!error()) {
      <div><strong>Total:</strong> {{ count() }}</div>
      <ads-list [items]="results()"></ads-list>
      }
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 900px;
        margin: 1rem auto;
        padding: 1rem;
        font-size: 0.9rem;
      }
      .container h1 {
        font-size: 1.25rem;
        margin: 0 0 0.25rem;
      }
      .container p {
        margin: 0 0 0.5rem;
        font-size: 0.55em;
      }
      .card {
        margin-top: 1rem;
        padding: 1rem;
        border: 1px solid #eee;
        border-radius: 8px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 0.5rem 0 1rem;
      }
      .row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .row.grow {
        flex: 1 1 100%;
      }
      .full {
        flex: 1 1 100%;
      }
    `,
  ],
})
export class AdsOverviewComponent implements OnInit {
  private readonly store = inject(ListingsStore);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  // Reuse store signals so template stays the same
  loading = this.store.loading;
  error = this.store.error;
  results = this.store.results;
  count = this.store.count;

  form = this.fb.nonNullable.group({
    property_type: this.fb.nonNullable.control('apartment'),
    sort_order: this.fb.nonNullable.control('5'),
    price_min: this.fb.nonNullable.control('1'),
    price_max: this.fb.nonNullable.control('400000'),
    area_min: this.fb.nonNullable.control('90'),
    area_max: this.fb.nonNullable.control('170'),
    keywords: this.fb.nonNullable.control('гараж'),
    regions: this.fb.nonNullable.control<string[]>([]),
  });

  regionOptions: string[] = [];

  ngOnInit(): void {
    // Restore previously selected regions from localStorage (if any)
    try {
      const raw = localStorage.getItem('lastSelectedRegions');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.every((x) => typeof x === 'string')) {
          this.form.controls.regions.setValue(arr as string[], {
            emitEvent: false,
          });
        }
      }
    } catch {
      // ignore parse errors
    }

    this.http
      .get<Record<string, Record<string, string>>>('/data/imot-bg-regions.json')
      .subscribe({
        next: (data) => {
          const opts: string[] = [];
          for (const inner of Object.values(data)) {
            for (const name of Object.keys(inner)) {
              opts.push(name);
            }
          }
          this.regionOptions = opts.sort((a, b) => a.localeCompare(b));
        },
        error: (err) => {
          console.error('Failed to load regions JSON', err);
        },
      });
  }

  private csvToArray(v: string): string[] | undefined {
    const arr = (v || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length ? arr : undefined;
  }

  private valOrUndef(v: string): string | undefined {
    const s = (v ?? '').toString().trim();
    return s ? s : undefined;
  }

  onSubmit() {
    const v = this.form.getRawValue();
    const criteria = {
      property_type: this.valOrUndef(v.property_type),
      sort_order: this.valOrUndef(v.sort_order),
      price: {
        min: this.valOrUndef(v.price_min),
        max: this.valOrUndef(v.price_max),
      },
      area_sqm: {
        min: this.valOrUndef(v.area_min),
        max: this.valOrUndef(v.area_max),
      },
      keywords: this.csvToArray(v.keywords),
      regions: v.regions && v.regions.length ? v.regions : undefined,
    } as const;

    // Persist selected regions for usability
    try {
      if (v.regions && v.regions.length) {
        localStorage.setItem('lastSelectedRegions', JSON.stringify(v.regions));
      } else {
        localStorage.removeItem('lastSelectedRegions');
      }
    } catch {
      // Storage may be unavailable; ignore
    }
    this.store.runCrawl(criteria);
  }
}
