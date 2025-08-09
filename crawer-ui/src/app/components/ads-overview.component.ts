import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingsStore } from '../listings.store';
import { ListingListComponent } from './listing-list.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ads-overview',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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
            <mat-label>Regions (comma separated)</mat-label>
            <input
              matInput
              formControlName="regions"
              placeholder="Стрелбище, Иван Вазов, Белите Брези"
            />
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

      <div class="card" *ngIf="error()">
        <strong>Error:</strong> {{ error() }}
      </div>

      <div class="card" *ngIf="!error()">
        <div><strong>Total:</strong> {{ count() }}</div>
        <ads-list [items]="results()"></ads-list>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 900px;
        margin: 1rem auto;
        padding: 1rem;
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
    regions: this.fb.nonNullable.control(
      'Стрелбище, Иван Вазов, Белите Брези, Манастирски ливади, Кръстова вада, Лозенец, Хиподрума'
    ),
  });

  ngOnInit(): void {
    console.log('ngOnInit');
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
      regions: this.csvToArray(v.regions),
    } as const;
    this.store.runCrawl(criteria);
  }
}
