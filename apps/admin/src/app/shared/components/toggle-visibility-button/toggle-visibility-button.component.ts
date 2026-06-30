import { Component, input, output } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  standalone: true,
  selector: 'em-toggle-visibility-button',
  templateUrl: './toggle-visibility-button.component.html',
  styleUrl: './toggle-visibility-button.component.scss',
  imports: [SvgIconComponent]
})
export class ToggleVisibilityButtonComponent {
  isVisible = input<boolean>(false);

  toggle = output<void>();

  onToggle(): void {
    this.toggle.emit();
  }

  get iconPath(): string {
    return `assets/icons/${this.isVisible() ? 'eye-black-open.svg' : 'eye-black-close.svg'}`;
  }

  get tooltipText(): string {
    return this.isVisible() ? 'Скрыть' : 'Показать';
  }
}

