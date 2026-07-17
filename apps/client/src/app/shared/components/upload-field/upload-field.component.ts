import {
  Component,
  Input,
  ElementRef,
  inject,
  signal,
  computed,
  output,
  viewChild
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { ToastEnum } from '@eskhata/util';
import { MessageService } from '@core/services/message.service';
import { SvgIconComponent } from 'angular-svg-icon';

import { IUploadField } from '@shared/components/upload-field/interface/upload-field.interface';

@Component({
  selector: 'em-upload-field',
  standalone: true,
  templateUrl: './upload-field.component.html',
  styleUrls: ['./upload-field.component.scss'],
  imports: [SvgIconComponent, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UploadFieldComponent
    }
  ]
})
export class UploadFieldComponent implements ControlValueAccessor {
  @Input() readOnly = false;
  @Input() fileTypes: string[];
  @Input() fileLimit = 5;
  @Input() maxFileSize = 5; // MB
  @Input() control: AbstractControl;
  @Input() placeholder = 'Прикрепить файл';

  readonly fileSelected = output<File>();
  readonly fileRemoved = output<IUploadField>();
  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  files = signal<IUploadField[]>([]);
  limitExceeded = computed(() => this.files().length >= this.fileLimit);
  acceptedTypes = computed(() =>
    this.fileTypes.map(type => `.${type}`).join(',')
  );

  private readonly messageService = inject(MessageService);

  onChange: any = () => {};
  onTouched: any = () => {};

  onFileInputClick(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    if (!this.isValidFileType(file)) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: `Недопустимый тип файла. Разрешены: ${this.fileTypes.join(', ')}`
      });
      return;
    }

    if (!this.isValidFileSize(file)) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: `Размер файла превышает ${this.maxFileSize} МБ`
      });
      return;
    }

    if (this.files().length >= this.fileLimit) {
      this.messageService.add({
        severity: ToastEnum.WARN,
        summary: 'Превышен лимит загрузки файлов'
      });
      return;
    }

    this.addFile(file);
    this.fileSelected.emit(file);

    target.value = '';
  }

  removeFile(index: number): void {
    const currentFiles = this.files();
    const removedFile = currentFiles[index];

    this.files.set(currentFiles.filter((_, i) => i !== index));
    this.fileRemoved.emit(removedFile);
    this.updateFormValue();
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) {
      return '../../../../assets/icons/document.svg';
    } else if (fileType.includes('image')) {
      return '../../../../assets/icons/picture-success.svg';
    }
    return '../../../../assets/icons/document.svg';
  }

  writeValue(value: any): void {
    if (!value) {
      this.files.set([]);
      return;
    }

    const files = Array.isArray(value) ? value : [value];
    const uploadFields: IUploadField[] = files.map((file: File) => ({
      file,
      fileName: file.name,
      status: 'success',
      showStatus: true,
      fileType: file.type,
      id: this.generateId()
    }));

    this.files.set(uploadFields);
  }

  registerOnChange(fn: (_: any) => object): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => object): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.readOnly = isDisabled;
  }

  private addFile(file: File): void {
    const fileData: IUploadField = {
      file,
      fileName: file.name,
      status: 'success',
      showStatus: true,
      fileType: file.type,
      id: this.generateId()
    };

    this.files.update(files => [...files, fileData]);
    this.updateFormValue();
  }

  private isValidFileType(file: File): boolean {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return this.fileTypes.includes(fileExtension || '');
  }

  private isValidFileSize(file: File): boolean {
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= this.maxFileSize;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private updateFormValue(): void {
    const fileList = this.files().map(f => f.file).filter(Boolean);
    this.onChange(fileList);
    this.onTouched();
  }
}
