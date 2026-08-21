import { Component, inject, OnInit } from '@angular/core';
import { EmHeaderComponent, MultiSelectComponent, SimpleSelectListComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { Location } from "@angular/common";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { NgxPermissionsModule } from "ngx-permissions";
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { MerchantService } from "@modules/merchant-container/merchant/services/merchant.service";
import { PosService } from "@modules/merchant-container/pos/services/pos.service";
import { DestroyableComponent } from '@eskhata/util';
import { ISelect } from '@eskhata/util';
import { IFilterParams, IHeader } from "@core/interfaces";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from '@eskhata/data-access';
import { HeaderService } from '@eskhata/data-access';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { finalize, map, Observable, of, Subject, timer } from "rxjs";
import { mergeMap, takeUntil } from "rxjs/operators";
import { setValidationErrors } from "@core/validators/set-validation-errors";
import { PhoneValidator } from "@core/validators/phone-validator";
import { PosTerminalService } from "@modules/user-container/pos-terminal/services/pos-terminal.service";
import { IHttpResponse } from "@core/interfaces/http-response.interface";
import { IUsers } from "@modules/user-container/user/interfaces/users.interface";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Platform } from "@angular/cdk/platform";


@Component({
  selector: 'em-pos-terminal-edit',
  standalone: true,
  imports: [
    MultiSelectComponent,
    NgxMaskDirective,
    ReactiveFormsModule,
    SimpleSelectListComponent,
    SvgIconComponent,
    ToastModule,
    ValidatorModule,
    NgxPermissionsModule,
    EmHeaderComponent,
],
  providers: [
    MerchantService,
    PosService,
    provideNgxMask()
  ],
  templateUrl: './pos-terminal-edit.component.html',
  styleUrl: './pos-terminal-edit.component.scss'
})
export class PosTerminalEditComponent extends DestroyableComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  clientRoleValues: ISelect[];
  posesDictionary: ISelect[];
  header: IHeader = {
    isFilter: false,
    tabShow: false
  };
  posFilter = '';
  posesDisabled: boolean;
  merchantsDictionary: ISelect[];

  private canDeactivate$ = new Subject<boolean>();
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly posTerminalService = inject(PosTerminalService);
  private readonly messageService = inject(MessageService);
  private readonly merchantService = inject(MerchantService);
  private readonly posService = inject(PosService);
  private readonly location = inject(Location);
  private readonly headerService = inject(HeaderService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly platform = inject(Platform);

  isMobile = this.platform.IOS || this.platform.ANDROID;
  updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  posTerminalId = this.activatedRoute.snapshot.params['id'];

  constructor() {
    super();
    this.initData();
    this.createForm();
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
    if (this.posTerminalId) {
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
      this.messageService.add({severity: ToastEnum.ERROR, summary: "Неправильно заполнены данные!"});
      return null;
    }
    this.submitted = true;
    let $observer: Observable<IHttpResponse<IUsers>>;
    const body = this.makeReqBody();

    $observer = this.posTerminalId ?
      this.posTerminalService.updatePosTerminal(body) : this.posTerminalService.createPosTerminal(body);

    $observer
      .pipe(
        finalize(() => this.submitted = false),
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return timer(res.status ? 2000 : 0)
            .pipe(map(() => res))
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.router.navigate(['/user/pos-terminal'])
            .catch();
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
    this.posTerminalService.getPosTerminalDetail(this.posTerminalId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.form.patchValue(res.data);
          this.form.updateValueAndValidity();
          this.posFilter = 'merchantId==' + res.data.merchants.join('|');
          if (this.posFilter) {
            this.getPosDictionary({filters: this.posFilter});
            this.posesDisabled = true;
          }
        }
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
      })
  }

  private getPosDictionary(params: IFilterParams): void {
    const queryParams = { addDeactives: true };
    const bodyParams = { ...params };
    this.posService.getPosDictionaryWithoutPagination(queryParams, bodyParams)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posesDictionary = res.data;
        }
      });
  }

  private getUserRolesDictionary(): void {
    this.posTerminalService.getPosTerminalDictionaryRoles()
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
        Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')
      ]],
      firstName: ['', [
        Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')
      ]],
      middleName: ['', [Validators.pattern('^[a-zA-Zа-яёА-ЯЁ]+(-[a-zA-Zа-яёА-ЯЁ]+)*$')]],
      userName: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.minLength(6),
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z]+[.a-zA-Z0-9_-]*')]],
      phoneNumber: ['+992', PhoneValidator.validate()],
      email: [''],
      roles: this.fb.array([this.fb.control('', Validators.required)]),
      isActive: [false],
      merchants: [[], Validators.required],
      poses: [[], Validators.required],
    });
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
    this.form.patchValue({
      merchants: []
    });
    if (checked) {
      this.form.patchValue({
        merchants: this.merchantsDictionary.map(merchant => merchant.id)
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
        poses: this.posesDictionary.map(pose => pose.id)
      });
    } else {
      this.form.patchValue({
        poses: []
      });
      this.changeMerchant(this.form.get('merchants').value);
    }
  }

  isMerchantSelected(): boolean {
    const merchantsArray = this.form.get('merchants').value;
    return merchantsArray && merchantsArray.length > 0;
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasChanges()) {
      return of(true);
    }

    this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Данные будут утеряны. Вы действительно хотите покинуть страницу?',
        successButtonText: 'Да',
        cancelButtonText: 'Нет'
      },
      maxWidth: '90vw'
    })
      .afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => this.canDeactivate$.next(res));

    return this.canDeactivate$;
  }

  private hasChanges(): boolean {
    if (!this.form) {
      return false;
    }
    const hasChanges = Object.values(this.form.value).some(item => !!item);
    return this.form.dirty && hasChanges && this.form.touched;
  }
}
