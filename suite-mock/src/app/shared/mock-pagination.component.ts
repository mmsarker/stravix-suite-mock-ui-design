import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "suite-pagination",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="suite-pager" role="navigation" aria-label="Table pagination">
      <span class="pager-range">{{
        total ? first + "–" + last + " of " + total : "No results"
      }}</span>
      <label
        >Rows per page
        <select
          [ngModel]="size"
          (ngModelChange)="pageSizeChange.emit(+$event)"
          aria-label="Rows per page"
        >
          <option *ngFor="let option of sizes" [ngValue]="option">
            {{ option }}
          </option>
        </select>
      </label>
      <span class="pager-page">Page {{ page }} of {{ pages }}</span>
      <div class="pager-buttons">
        <button
          type="button"
          (click)="pageChange.emit(1)"
          [disabled]="page <= 1"
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          (click)="pageChange.emit(page - 1)"
          [disabled]="page <= 1"
          aria-label="Previous page"
        >
          ‹
        </button>
        <button
          type="button"
          (click)="pageChange.emit(page + 1)"
          [disabled]="page >= pages"
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          (click)="pageChange.emit(pages)"
          [disabled]="page >= pages"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  `,
})
export class MockPaginationComponent {
  @Input() first = 0;
  @Input() last = 0;
  @Input() total = 0;
  @Input() page = 1;
  @Input() pages = 1;
  @Input() size = 10;
  @Input() sizes: number[] = [10, 20, 50];
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly pageSizeChange = new EventEmitter<number>();
}
