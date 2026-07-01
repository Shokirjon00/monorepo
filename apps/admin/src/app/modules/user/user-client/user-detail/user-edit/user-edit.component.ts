import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { Location } from '@angular/common';
import { ClientUsersService } from '@modules/user/user-client/services/client-users.service';
import { delay, filter, mergeMap, switchMap, tap } from 'rxjs/operators';
import { ISelect } from '@core/interfaces/select.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { PosService } from '@modules/client/pos/services/pos.service';
import { IHeader } from '@core/interfaces/header.interface';
import { ToastEnum } from '@eskhata/util';
import { finalize, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { environment as env } from '@environments/environment';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { PhoneValidator } from '@core/validators/phone-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { NgxMaskDirective } from "ngx-mask";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { MultiSelectComponent } from "@shared/components/multi-select/multi-select.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { PasswordResetDialogComponent } from "@modules/user/password-reset-dialog/password-reset-dialog.component";
import { IUsers } from "@modules/user/user-client/interfaces/users.interface";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IHttpResponse } from "@core/interfaces/http-response.interface";

@Component({
  standalone: true,
  selector: 'em-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  providers: [
    ClientUsersService,
    MerchantService,
    PosService
  ],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    NgxMaskDirective,
    SimpleSelectListComponent,
    AutocompleteComponent,
    MultiSelectComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsAllowStubDirective,
    EbLoaderComponent
  ]
})
export class UserEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  submitted: boolean;
  userClientDetail: any;
  clientRoleValues: ISelect[];
  userDetail: IUsers;
  clientUserId: string;
  companyDictionaryApi = `${env.api.companies}/${env.api.dictionary}`;
  header: IHeader = {
    isFilter: false,
    tabShow: false
  };
  merchantFilter = '';
  merchantsDictionary: ISelect[];
  posesDictionary: ISelect[];
  posFilter = '';
  merchantDisabled: boolean;
  posesDisabled: boolean = false;
  oldCompanyId: string;

  private readonly updateUrl: string;
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly fb = inject(FormBuilder);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly service = inject(ClientUsersService);
  protected readonly messageService = inject(MessageService);
  protected readonly merchantService = inject(MerchantService);
  protected readonly posService = inject(PosService);
  protected readonly router = inject(Router);

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
    this.updateUrl = this.activatedRoute.snapshot.routeConfig.path;
    this.clientUserId = this.activatedRoute.snapshot.parent.params['clientUserId'];
  }

  get clientRoles(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.createForm();
    if (this.clientUserId) {
      this.getUserClientById();
    }
    this.getClientRolesDictionary();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.showValidationError();
      return;
    }

    if (this.updateUrl === 'new') {
      this.handleNewUserCreation();
    } else {
      this.handleUserUpdate();
    }
  }

  toggleAllMerchants(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.form.patchValue({
        merchants: this.merchantsDictionary.map(merchant => merchant.id)
      });
    } else {
      this.form.patchValue({
        merchants: []
      });
    }
    this.changeMerchant(this.form.get('merchants').value);
  }

  allMerchantsSelected(): boolean {
    const merchantsArray = this.form.get('merchants').value || [];
    const allMerchants = this.merchantsDictionary || [];
    return allMerchants.length > 0 && merchantsArray.length === allMerchants.length;
  }

  allPosesSelected(): boolean {
    const posesArray = this.form.get('poses').value || [];
    const posesDictionary = this.posesDictionary || [];
    return posesDictionary.length > 0 && posesArray.length === posesDictionary.length;
  }

  toggleAllPoses(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.form.patchValue({
        poses: this.posesDictionary.map(pose => pose.id)
      });
    } else {
      this.form.patchValue({
        poses: []
      });
      this.changeMerchant(this.form.get('merchants').value);
    }
  }

  isCompanySelected(): boolean {
    const companyId = this.form.get('companyId').value;
    return !!companyId;
  }

  isMerchantSelected(): boolean {
    const merchantsArray = this.form.get('merchants').value;
    return merchantsArray && merchantsArray.length > 0;
  }

  getUserClientById(): void {
    this.service.getClientUserDetail(this.clientUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.userClientDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          this.form.updateValueAndValidity();
          this.oldCompanyId = this.userClientDetail.companyId
          this.merchantFilter = 'companyId==' + this.userClientDetail.companyId;
          this.posFilter = 'merchantId==' + this.userClientDetail.merchants.join('|');
          if (this.posFilter) {
            this.getPosDictionary({filters: this.posFilter});
            this.posesDisabled = true;
          }
        }
      });
  }

  selectedCompany(companyId: string): void {
    if (this.oldCompanyId !== companyId) {
      this.form.get('merchants').setValue('');
      this.form.get('poses').setValue('');
    }
    if (companyId === '') {
      this.merchantDisabled = false;
      this.posesDisabled = false;
    } else {
      this.merchantDisabled = true;
      this.getMerchantDictionary({filters: 'companyId==' + companyId})
    }
    this.merchantFilter = 'companyId==' + companyId;
    this.oldCompanyId = companyId;
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
      this.getPosDictionary({filters: 'merchantId==' + merchantIds.join('|')});
    }
    this.posFilter = 'merchantId==' + merchantIds.join('|');
  }

  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!'
    });
  }

  private handleNewUserCreation(): void {
    this.performSave().pipe(
      switchMap(res => {
        if (!res?.status || !res.data) return of(null);

        const newUserId = res.data;
        return this.openSendLoginDialog(newUserId);
      }),
      filter(res => res !== null),
      delay(2000),
      tap(() => {
        this.redirectToClientList();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private handleUserUpdate(): void {
    this.performSave().pipe(
      tap(res => {
        if (res?.status) {
          this.form.markAsPristine();
          this.redirectToClientList();
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private openSendLoginDialog(userId: string): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Хотите отправить логин и пароль пользователю на номер телефона?'
      },
    });

    return dialogRef.afterClosed().pipe(
      switchMap((shouldSend: boolean) => {
        if (shouldSend) {
          return this.service.sendFirstLoginData({id: userId}).pipe(
            mergeMap(sendRes => {
              this.messageService.add({
                severity: sendRes.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
                summary: sendRes.message
              });

              return of(sendRes).pipe(delay(sendRes.status ? 2000 : 0));
            })
          );
        }

        this.router.navigate(['/user/client']).catch();
        return of(null);
      })
    );
  }

  private redirectToClientList(): void {
    this.router.navigate(['/user/client']).catch();
  }

  private performSave(): Observable<any> {
    this.submitted = true;
    const body = this.makeReqBody();
    let $observer: Observable<any>;
    if (this.clientUserId) {
      $observer = this.service.updateClientUser(body);
    } else {
      $observer = this.service.createClientUser(body);
    }

    return $observer.pipe(
      mergeMap(res => {
        this.messageService.add({
          severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
          summary: res.message
        });

        if (!res.status) {
          setValidationErrors(this.form, res);
          return of(res);
        }

        return of(res).pipe(delay(1000));
      }),
      finalize(() => (this.submitted = false))
    );
  }

  private makeReqBody(): any {
    const merchantsArray = this.form.get('merchants').value;
    const allMerchantsSelected = merchantsArray.length === this.merchantsDictionary?.length;

    const posesArray = this.form.get('poses').value;
    const allPosesSelected = posesArray.length === this.posesDictionary?.length;

    const data = this.form.value;
    delete data.merchants;
    delete data.poses;

    const body = {
      ...data,
      merchant: {
        ids: allMerchantsSelected ? [] : merchantsArray,
        selectedAll: allMerchantsSelected
      },
      pos: {
        ids: allPosesSelected ? [] : posesArray,
        selectedAll: allPosesSelected
      }
    };

    return body;
  }

  private getClientRolesDictionary(): void {
    this.service.getClientRolesDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.clientRoleValues = res.data;
        this.form.updateValueAndValidity();
      })
  }

  private createForm(): void {
    this.form = this.fb.group({
      id: [],
      lastName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')]],
      firstName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')]],
      middleName: ['',
        Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')],
      userName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z]+[.a-zA-Z0-9_-]*')]],
      phoneNumber: ['992', [Validators.required, PhoneValidator.validate()]],
      email: [''],
      roles: this.fb.array([this.fb.control(null, Validators.required)]),
      companyId: ['', Validators.required],
      merchants: [[], Validators.required],
      poses: [[], Validators.required],
      isActive: [false]
    });
  }

  private getMerchantDictionary(params: IFilterParams): void {
    params.addDeactives = true;
    this.merchantService.getMerchantsWithoutPagination(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.merchantsDictionary = res.data;
        }
      });
  }

  private getPosDictionary(params: IFilterParams): void {
    const queryParams = {addDeactives: true};
    const bodyParams = {...params};
    this.posService.getPosDictionaryWithoutPagination(queryParams, bodyParams)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.posesDictionary = res.data;
        }
      });
  }
}
