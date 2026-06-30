import {Directive, HostListener} from "@angular/core";

@Directive({
  selector: "[emPreventSpace]",
  standalone: true
})
export class PreventSpaceDirective {
  @HostListener("keydown.space")
  keyDown(): boolean {
    return false;
  }
}
