import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from '@core/services/message.service';
import { FormArray, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { takeUntil } from 'rxjs';
import { ToastEnum } from '@core/enums/toast-enum';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CompanyService } from '@modules/client/company/services/company.service';

@Component({
  standalone: true,
  selector: 'em-choose-phone-number-dialog',
  templateUrl: './choose-phone-number-dialog.html',
  styleUrls: ['./choose-phone-number-dialog.scss'],
  imports: [
    FormsModule,
    AngularSvgIconModule
],
  providers: [CompanyService]
})

export class ChoosePhoneNumberDialogComponent extends DestroyableComponent {
  phoneNumbersData: string[];
  filteredPhones: any[];
  form: FormGroup;
  searchText: string;

  dialogRef = inject(MatDialogRef<ChoosePhoneNumberDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  constructor() {
    super();
    this.getPhoneNumbers();
    this.createForm();
  }

  get phoneNumbers(): FormArray {
    return this.form.get('phoneNumbers') as FormArray;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.companyService.sendTelegramLink(this.form.value)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.dialogRef.close(res.message);
        } else {
          this.messageService.add({severity: ToastEnum.ERROR, summary: res.message});
        }
      })
  }

  searchBranch(): void {
    if (this.searchText) {
      this.filteredPhones = this.phoneNumbersData.filter(x => x.toLowerCase().includes(this.searchText.toLowerCase()));
    } else {
      this.filteredPhones = this.phoneNumbersData;
    }
  }

  checkAllPhone(event: Event): void {
    if ((<HTMLInputElement>event.target).checked) {
      this.phoneNumbers.clear();
      this.phoneNumbersData.forEach(phone => this.phoneNumbers.push(this.fb.control(phone)))
    } else {
      this.phoneNumbers.clear();
    }
  }

  phoneSelect(phoneNumber: string, e: any): void {
    const checkId = this.phoneNumbers.value.findIndex((item: string) => item === phoneNumber);
    if (!e.checked) {
      this.phoneNumbers.removeAt(checkId);
    } else {
      this.phoneNumbers.push(this.fb.control(phoneNumber));
    }
  }

  private getPhoneNumbers(): void {
    this.companyService.getCompanyPossPhoneNumber(this.data.companyId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.phoneNumbersData = res.data.posPhoneNumbers;
          this.filteredPhones = res.data.posPhoneNumbers;
        }
      })
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: this.data.companyId,
      phoneNumbers: this.fb.array([])
    })
  }
}
