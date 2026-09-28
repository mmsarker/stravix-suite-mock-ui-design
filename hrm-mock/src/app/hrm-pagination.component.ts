import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "hrm-pagination",
  standalone: true,
  template: `
    <nav class="hrm-pagination" aria-label="Table pagination">
      <span class="hrm-page-summary"
        >Showing <strong>{{ start }}–{{ end }}</strong> of
        <strong>{{ total }}</strong> {{ label }}</span
      >
      <div class="hrm-page-controls">
        <label
          >Rows per page
          <select
            [value]="pageSize"
            (change)="pageSizeChange.emit(+$any($event.target).value)"
            aria-label="Rows per page"
          >
            @for (size of pageSizes; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
        </label>
        <div class="hrm-page-buttons">
          <button
            type="button"
            aria-label="Previous page"
            [disabled]="page <= 1"
            (click)="pageChange.emit(page - 1)"
          >
            ‹
          </button>
          @for (number of pages; track number) {
            <button
              type="button"
              [class.active]="number === page"
              [attr.aria-current]="number === page ? 'page' : null"
              (click)="pageChange.emit(number)"
            >
              {{ number }}
            </button>
          }
          <button
            type="button"
            aria-label="Next page"
            [disabled]="page >= pageCount"
            (click)="pageChange.emit(page + 1)"
          >
            ›
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .hrm-pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 18px;
        border-top: 1px solid var(--ds-border);
        color: var(--ds-muted);
        font-size: 12px;
      }
      .hrm-page-summary strong {
        color: var(--ds-ink);
        font-weight: 750;
      }
      .hrm-page-controls {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .hrm-page-controls label {
        display: flex;
        align-items: center;
        gap: 9px;
        white-space: nowrap;
      }
      .hrm-page-controls select {
        height: 35px;
        padding: 0 28px 0 10px;
        border: 1px solid var(--ds-border);
        border-radius: 8px;
        background: #fff;
        color: var(--ds-ink);
        font: inherit;
      }
      .hrm-page-buttons {
        display: flex;
        gap: 4px;
      }
      .hrm-page-buttons button {
        width: 34px;
        height: 34px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: transparent;
        color: var(--ds-muted);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .hrm-page-buttons button.active {
        border-color: #b9dcda;
        background: #eaf6f5;
        color: #0b7778;
      }
      .hrm-page-buttons button:hover:not(:disabled) {
        background: #f1f6fa;
        color: var(--ds-ink);
      }
      .hrm-page-buttons button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      @media (max-width: 680px) {
        .hrm-pagination,
        .hrm-page-controls {
          align-items: flex-start;
          flex-direction: column;
        }
        .hrm-page-controls {
          width: 100%;
          gap: 10px;
        }
        .hrm-page-controls label {
          justify-content: space-between;
          width: 100%;
        }
        .hrm-page-controls label select {
          margin-left: auto;
        }
      }
    `,
  ],
})
export class HrmPaginationComponent {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() label = "records";
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  readonly pageSizes = [10, 20, 50];
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  get start(): number {
    return this.total ? (this.page - 1) * this.pageSize + 1 : 0;
  }
  get end(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }
  get pages(): number[] {
    const start = Math.max(1, Math.min(this.page - 2, this.pageCount - 4));
    return Array.from(
      { length: Math.min(5, this.pageCount) },
      (_, index) => start + index,
    );
  }
}
