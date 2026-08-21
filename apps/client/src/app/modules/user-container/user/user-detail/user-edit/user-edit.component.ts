import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { HeaderService } from '@eskhata/data-access';
import { DestroyableComponent } from '@eskhata/util';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@eskhata/data-access';
import { Location } from '@angular/common';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { ISelect } from '@eskhata/util';
import { IFilterParams } from '@eskhata/util';
import { IHeader } from '@eskhata/util';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, Observable, of, timer } from 'rxjs';
import { MerchantService } from '@modules/merchant-container/merchant/services/merchant.service';
import { PosService } from '@modules/merchant-container/pos/services/pos.service';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { PhoneValidator } from '@core/validators/phone-validator';
import { SvgIconComponent } from 'angular-svg-icon';
import { EmHeaderComponent, MultiSelectComponent, SimpleSelectListComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { NgxPermissionsAllowStubDirective } from 'ngx-permissions';
import { UsersService } from '@modules/user-container/user/services/users.service';
import { Platform } from '@angular/cdk/platform';
import { MatDialog } from '@angular/material/dialog';
import { PasswordResetDialogComponent } from '@modules/user-container/password-reset-dialog/password-reset-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  selector: 'em-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    ValidatorModule,
    MultiSelectComponent,
    ToastModule,
    NgxPermissionsAllowStubDirective,
    NgxMaskDirective,
    SimpleSelectListComponent,
    EmHeaderComponent,
  ],
  providers: [MerchantService, PosService, provideNgxMask()],
})
export class UserEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  clientRoleValues: ISelect[];
  posesDictionary: ISelect[];
  userId: string;
  header: IHeader = {
    isFilter: false,
    tabShow: false,
  };
  posFilter = '';
  posesDisabled: boolean;
  updateUrl: string;
  merchantsDictionary: ISelect[];
  isMobile: boolean;

  protected readonly destroyRef = inject(DestroyRef);
  protected readonly dialog = inject(MatDialog);
  protected readonly fb = inject(FormBuilder);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly service = inject(UsersService);
  protected readonly messageService = inject(MessageService);
  protected readonly merchantService = inject(MerchantService);
  protected readonly posService = inject(PosService);
  protected readonly location = inject(Location);
  protected readonly headerService = inject(HeaderService);
  protected readonly platform = inject(Platform);

  constructor() {
    super();
    this.initData();
    this.createForm();
    this.isMobile = this.platform.IOS || this.platform.ANDROID;
    this.updateUrl = this.activatedRoute.snapshot.routeConfig.path;
    this.userId = this.activatedRoute.snapshot.parent.params['userId'];
  }

  get clientRoles(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.getMerchantDictionary({});
    this.getUserRolesDictionary();
    if (this.userId) {
      this.getUserClientById();
    }
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.header);
  }

  back(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showValidationError();
      return;
    }

    this.handleFormSubmit().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  changeMerchant(merchantIds: string[]): void {
    const currentPoses = this.form.get('poses').value || [];
    const updatedPoses = currentPoses.filter((poseId: string) => {
      const pos = this.posesDictionary.find(pos => pos.id === poseId);
      return pos && merchantIds.includes(pos.id);
    });
    this.form.get('poses').setValue(updatedPoses);
    if (merchantIds.length === 0) {
      this.posesDisabled = false;
    } else {
      this.posesDisabled = true;
      this.getPosDictionary({ filters: 'merchantId==' + merchantIds.join('|') });
    }
    this.posFilter = 'merchantId==' + merchantIds.join('|');
  }

  toggleAllMerchants(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.form.patchValue({
      merchants: [],
    });
    if (checked) {
      this.form.patchValue({
        merchants: this.merchantsDictionary.map(merchant => merchant.id),
      });
    }
    this.changeMerchant(this.form.get('merchants').value);
  }

  allMerchantsSelected(): boolean {
    const merchantsArray = this.form.get('merchants').value || [];
    const allMerchants = this.merchantsDictionary || [];
    return allMerchants.length > 0 && allMerchants.every(merchant => merchantsArray.includes(merchant.id));
  }

  allPosesSelected(): boolean {
    const posesArray = this.form.get('poses').value || [];
    const posesDictionary = this.posesDictionary || [];
    return posesDictionary.length > 0 && posesDictionary.every(pose => posesArray.includes(pose.id));
  }

  toggleAllPoses(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.form.patchValue({
        poses: this.posesDictionary.map(pose => pose.id),
      });
    } else {
      this.form.patchValue({
        poses: [],
      });
      this.changeMerchant(this.form.get('merchants').value);
    }
  }

  isMerchantSelected(): boolean {
    const merchantsArray = this.form.get('merchants').value;
    return merchantsArray && merchantsArray.length > 0;
  }

  getUserClientById(): void {
    this.service
      .getUserDetail(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.form.patchValue(res.data);
          this.form.updateValueAndValidity();
          this.posFilter = 'merchantId==' + res.data.merchants.join('|');
          if (this.posFilter) {
            this.getPosDictionary({ filters: this.posFilter });
            this.posesDisabled = true;
          }
        }
      });
  }

  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!',
    });
  }

  private handleFormSubmit(): Observable<void> {
    return this.performSave().pipe(
      switchMap(res => {
        if (!res?.status) return of(null);

        if (this.updateUrl === 'new' && res.data) {
          return this.handleNewUserFlow(res.data);
        }

        return this.finishAndGoBack(2000);
      })
    );
  }

  private handleNewUserFlow(newUserId: string): Observable<void> {
    const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
    });

    return dialogRef.afterClosed().pipe(
      switchMap((shouldSend: boolean) => {
        if (shouldSend) {
          return this.service.sendFirstLoginData({ id: newUserId }).pipe(
            tap(sendRes => {
              this.messageService.add({
                severity: sendRes.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
                summary: sendRes.message,
              });
            })
          );
        }
        return of(null);
      }),
      switchMap(() => this.finishAndGoBack(1000))
    );
  }

  private finishAndGoBack(delay: number): Observable<any> {
    return timer(delay).pipe(tap(() => this.back()));
  }

  private performSave(): Observable<any> {
    this.submitted = true;
    const body = this.makeReqBody();
    let $observer: Observable<any>;

    if (this.userId) {
      $observer = this.service.updateUser(body);
    } else {
      $observer = this.service.createUser(body);
    }

    return $observer.pipe(
      tap(res => {
        if (res.status) {
          this.messageService.add({
            severity: ToastEnum.SUCCESS,
            summary: res.message,
          });
        } else {
          setValidationErrors(this.form, res);
        }
      }),
      finalize(() => (this.submitted = false))
    );
  }

  private makeReqBody(): any {
    const merchantsArray = this.form.get('merchants').value;
    const allMerchantsSelected = merchantsArray.length === this.merchantsDictionary.length;
    const posesArray = this.form.get('poses').value;
    const allPosesSelected = posesArray.length === this.posesDictionary.length;
    const data = this.form.value;
    delete data.merchants;
    delete data.poses;

    const body = {
      ...data,
      merchant: {
        ids: allMerchantsSelected ? [] : merchantsArray,
        selectedAll: allMerchantsSelected,
      },
      pos: {
        ids: allPosesSelected ? [] : posesArray,
        selectedAll: allPosesSelected,
      },
    };

    return body;
  }

  private getMerchantDictionary(params: IFilterParams): void {
    params.addDeactives = true;
    this.merchantService
      .getMerchantsWithoutPagination(params)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.merchantsDictionary = res.data;
        }
      });
  }

  private getPosDictionary(params: IFilterParams): void {
    const queryParams = { addDeactives: true };
    const bodyParams = { ...params };
    this.posService
      .getPosDictionaryWithoutPagination(queryParams, bodyParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.posesDictionary = res.data;
        }
      });
  }

  private getUserRolesDictionary(): void {
    const params = { pageSize: 50, pageNumber: 1 };
    this.service
      .getRolesDictionary(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.clientRoleValues = res.data;
        this.form.updateValueAndValidity();
      });
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [],
      lastName: [
        '',
        [
          Validators.required,
          WhiteSpaceValidator.validate(),
          Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$'),
        ],
      ],
      firstName: [
        '',
        [
          Validators.required,
          WhiteSpaceValidator.validate(),
          Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$'),
        ],
      ],
      middleName: ['', [Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')]],
      userName: [
        '',
        [
          Validators.required,
          WhiteSpaceValidator.validate(),
          Validators.minLength(6),
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z]+[.a-zA-Z0-9_-]*'),
        ],
      ],
      phoneNumber: ['+992', PhoneValidator.validate()],
      email: [''],
      roles: this.fb.array([this.fb.control('', Validators.required)]),
      isActive: [false],
      merchants: [[], Validators.required],
      poses: [[], Validators.required],
    });
  }
}
