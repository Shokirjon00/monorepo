import {Directive, HostListener} from "@angular/core";

@Directive({
  selector: "[emPreventSpace]"
})
export class PreventSpaceDirective {
  @HostListener("keydown.space", ["$event"])
  keyDown(): boolean {
    return false;
  }
}
