import { Routes } from '@angular/router';
import { ListingDetailComponent } from './components/listing-detail.component';
import { AdsOverviewComponent } from './components/ads-overview.component';

export const routes: Routes = [
  { path: '', component: AdsOverviewComponent },
  { path: 'listing', component: ListingDetailComponent },
  { path: '**', redirectTo: '' },
];
