import { bootstrapApplication } from "@angular/platform-browser";
import { provideRouter, withHashLocation } from "@angular/router";
import { SuiteMockAppComponent } from "./app/suite-mock-app.component";
import { routes } from "./app/suite-mock.routes";

bootstrapApplication(SuiteMockAppComponent, {
  providers: [provideRouter(routes, withHashLocation())],
}).catch((error: unknown) =>
  console.error("Unable to start the Stravix Suite design mock.", error),
);
