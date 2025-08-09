import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Listing } from '../crawl.service';
import { ListingItemComponent } from './listing-item.component';

@Component({
  selector: 'ads-list',
  standalone: true,
  imports: [CommonModule, ListingItemComponent],
  template: `
    @if(items?.length){
    <div class="results-list">
      @for(item of items; track $index){
      <ad-listing-item [listing]="item" />
      }
    </div>
    } @else{
    <ng-template #empty>
      <pre>No results yet.</pre>
    </ng-template>
    }
  `,
  styles: [
    `
      .results-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
    `,
  ],
})
export class ListingListComponent {
  @Input({ required: true }) items: Listing[] = [];
}
