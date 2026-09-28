import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withHashLocation } from "@angular/router";
import { HrmMockAppComponent } from "./app/hrm-mock-app.component";
import { routes } from "./app/hrm-mock.routes";

bootstrapApplication(HrmMockAppComponent, {
  providers: [provideRouter(routes, withHashLocation())],
}).catch((error: unknown) =>
  console.error("Unable to start the HRM design mock.", error),
);
