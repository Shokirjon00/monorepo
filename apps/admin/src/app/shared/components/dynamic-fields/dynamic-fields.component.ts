import {Component, input, OnInit, inject, DestroyRef} from '@angular/core';
import 'cronstrue/locales/ru';
import {SvgIconComponent} from "angular-svg-icon";
import {IComponent} from "@modules/setting-container/setting/interfaces/components";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CronDescriptionPipe} from "@core/pipe/cron-description.pipe";
import {UploadFieldComponent} from '@eskhata/ui';

import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {EmChipsComponent} from "@shared/components/em-chips/em-chips.component";

@Component({
  standalone: true,
  selector: 'em-dynamic-fields',
  templateUrl: './dynamic-fields.component.html',
  styleUrl: './dynamic-fields.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    UploadFieldComponent,
    SvgIconComponent,
    CronDescriptionPipe,
    EmChipsComponent
]
})
export class DynamicFieldsComponent implements OnInit {
  readonly fields = input<IComponent[]>([]);
  readonly form = input<FormGroup>();
  readonly showNameAbove = input<boolean>(false);
  readonly labelsForm = input<FormGroup>();
  readonly fileStorageUrl = input<string>();
  readonly fileStorageToken = input<string>();
  readonly fileTypes = input<string[]>(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
  readonly fileLimit = input<number>(1);
  readonly uploadPath = input<string>('/files/upload');

  private destroyRef = inject(DestroyRef);
  private fileValues = new Map<string, any>();
  private uploadPaths = new Map<string, string>();

  ngOnInit() {
    this.initializeUploadPaths();
    this.initializeFieldSubscriptions();
  }

  getLabelControl(id: string | number): FormControl | null {
    if (!id) return null;
    const control = this.labelsForm()?.get(id.toString());
    return control instanceof FormControl ? control : null;
  }

  getFormControl(path: string): FormControl | null {
    const control = this.form()?.get(path);
    return control instanceof FormControl ? control : null;
  }

  onChipsChange(fieldName: string, items: string[]): void {
    const control = this.getFormControl(fieldName);
    if (!control) return;
    control.setValue(items);
    control.markAsDirty();
    control.updateValueAndValidity();
  }

  onNumberInput(field: IComponent, event: Event): void {
    const input = event.target as HTMLInputElement;
    const valueStr = input.value;

    if (valueStr === '') {
      this.setFormControlValue(field.name, null);
    } else {
      const value = parseFloat(valueStr);
      if (!isNaN(value)) {
        this.setFormControlValue(field.name, value);
      }
    }
  }

  onFileUploaded(event: { fileId: string, fieldName: string, fieldIndex: number }): void {
    const field = this.fields().find(f => f.name === event.fieldName);
    if (field) this.setFormControlValue(field.name, event.fileId);
  }

  onFileDeactivated(field: IComponent, _fileIds: any[], _index: number): void {
    this.setFormControlValue(field.name, null);
  }

  getArrayItems(fieldName: string): string[] {
    const control = this.getFormControl(fieldName);
    return this.normalizeToArray(control?.value);
  }

  isListString = (field: IComponent): boolean => {
    return !!field && field.type === 'list_string';
  };

  private initializeUploadPaths(): void {
    this.fields().forEach((field, index) => {
      if (field.type === 'file') {
        const pathKey = `${field.name}_${index}`;
        const uploadPath = `${this.uploadPath()}?field=${field.name}_${index}`;
        this.uploadPaths.set(pathKey, uploadPath);
      }
    });
  }

  private normalizeToArray(value: unknown): string[] {
    if (value == null) return [];

    if (Array.isArray(value)) return value.map(v => String(v));

    if (typeof value !== 'string') return [];

    const trimmed = value.trim();

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(v => String(v));
      }
    } catch {
      void 0;
    }

    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    return trimmed ? [trimmed] : [];
  }

  private initializeFieldSubscriptions(): void {
    this.fields().forEach(field => {
      const control = this.getFormControl(field.name);
      if (control) {
        if (control.value) {
          this.fileValues.set(field.name, control.value);
        }
        control.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value => this.fileValues.set(field.name, value));
      }
    });
  }

  private setFormControlValue(path: string, value: any): void {
    const control = this.getFormControl(path);
    if (control) {
      control.setValue(value);
      control.markAsDirty();
      control.updateValueAndValidity();
      this.fileValues.set(path, value);
    }
  }

}
