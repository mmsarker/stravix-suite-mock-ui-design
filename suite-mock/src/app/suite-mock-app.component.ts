import { Component, DestroyRef, inject } from "@angular/core";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";

@Component({
  selector: "suite-root",
  standalone: true,
  imports: [RouterOutlet],
  template: "<router-outlet />",
})
export class SuiteMockAppComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const syncSurface = (): void => {
      const path = this.router.url.split("?")[0];
      const active =
        /^\/app\/(?:procurement\/(?!home(?:\/|$)|suppliers(?:\/|$)).+|finance\/(?:user-guide|system-detail|receivables|payables|banking|reconciliation|reports|integrations|settings|cost-centers|vds|partners|fixed-assets|budgets)(?:\/|$)|school-management(?:\/|$)|guardian(?:\/|$)|training-institute(?:\/|$))/.test(
          path,
        );
      document.body.classList.toggle("suite-preview-active", active);
    };
    syncSurface();
    const subscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(syncSurface);
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      document.body.classList.remove("suite-preview-active");
    });
  }
}
