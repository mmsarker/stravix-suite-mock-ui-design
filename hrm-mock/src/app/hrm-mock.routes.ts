import { Routes, UrlMatcher } from "@angular/router";
import { Component } from "@angular/core";
import { HrmWorkspaceComponent } from "./hrm-workspace.component";

const hrmMatcher: UrlMatcher = (segments) =>
  segments[0]?.path === "app" &&
  segments[1]?.path === "hrm" &&
  segments[2]?.path !== "me"
    ? { consumed: segments }
    : null;

@Component({ standalone: true, template: "", styles: [":host{display:none}"] })
class LegacyPassThroughComponent {}

export const routes: Routes = [
  { matcher: hrmMatcher, component: HrmWorkspaceComponent },
  { path: "**", component: LegacyPassThroughComponent },
];
