import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { Location } from '@angular/common';
import { delay, mergeMap, takeUntil } from 'rxjs/operators';
import { ISelect } from '@core/interfaces/select.interface';
import { MerchantService } from '@modules/client/merchant/services/merchant.service';
import { PosService } from '@modules/client/pos/services/pos.service';
import { IHeader } from '@core/interfaces/header.interface';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { environment as env } from '@environments/environment';
import { PhoneValidator } from '@core/validators/phone-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { IFilterParams } from '@core/interfaces/filter-params.interface';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { UsersRolesService } from "@modules/user/user-roles/services/users-roles.service";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { NgxMaskDirective } from "ngx-mask";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { AutocompleteComponent } from "@shared/components/autocomplete/autocomplete.component";
import { MultiSelectComponent } from "@shared/components/multi-select/multi-select.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-user-roles-edit',
  templateUrl: './user-roles-edit.component.html',
  styleUrls: ['./user-roles-edit.component.scss'],
  imports: [
    SvgIconComponent,
    NgxPermissionsModule,
    ReactiveFormsModule,
    ValidatorComponent,
    NgxMaskDirective,
    SimpleSelectListComponent,
    AutocompleteComponent,
    MultiSelectComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsAllowStubDirective
  ],
  providers: [
    UsersRolesService,
    MerchantService,
    PosService
  ],
})
export class UserRolesEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  submitted: boolean;
  userClientDetail: any;
  clientRoleValues: ISelect[];
  oldCompanyId: string;

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

  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(UsersRolesService);
  private readonly messageService = inject(MessageService);
  private readonly merchantService = inject(MerchantService);
  private readonly posService = inject(PosService);
  clientUserId = this.activatedRoute.snapshot.parent.params['userRolesId'];

  constructor(
    location: Location,
    dialog: MatDialog,
    ) {
    super(location, dialog);
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
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return;
    }

    this.submitted = true;
    let $observer: Observable<any>;

    const body = this.makeReqBody();

    $observer = this.clientUserId ?
      this.service.updateClientUser(body) : this.service.createClientUser(body);

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => {
          this.submitted = false;
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.back();
        } else {
          setValidationErrors(this.form, res);
        }
      });
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
        selectedAll: allMerchantsSelected
      },
      pos: {
        ids: allPosesSelected ? [] : posesArray,
        selectedAll: allPosesSelected
      }
    };

    return body;
  }


  getUserClientById(): void {
    this.service.getClientUserDetail(this.clientUserId)
      .pipe(takeUntil(this.destroyed$))
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

  private getClientRolesDictionary(): void {
    this.service.getClientRolesDictionary()
      .pipe(takeUntil(this.destroyed$))
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
      .pipe(takeUntil(this.destroyed$))
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
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posesDictionary = res.data;
        }
      });
  }

}
