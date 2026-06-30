import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { finalize, Observable, of, timer } from 'rxjs';
import { ToastEnum } from '@core/enums/toast-enum';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserAdminService } from '@modules/user/user-admin/services/user-admin.service';
import { IUserAdmin } from '@modules/user/user-admin/interfaces/user-admin.interface';
import { MessageService } from '@core/services/message.service';
import { Location } from '@angular/common';
import { ISelect } from '@core/interfaces/select.interface';
import { BranchService } from '@modules/directory/branch/services/branch.service';
import { delay, filter, mergeMap, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EskhataEmailValidator } from '@core/validators/email-validator';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { PhoneValidator } from '@core/validators/phone-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsAllowStubDirective, NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { NgxMaskDirective } from "ngx-mask";
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { EbLoaderComponent } from "@shared/components/eb-loader/eb-loader.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { PasswordResetDialogComponent } from "@modules/user/password-reset-dialog/password-reset-dialog.component";
import { AdminUsersService } from "@modules/user/user-client/services/admin-users.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: 'em-user-admin-edit',
  templateUrl: './user-admin-edit.component.html',
  styleUrls: ['./user-admin-edit.component.scss'],
  providers: [UserAdminService, AdminUsersService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    NgxMaskDirective,
    SimpleSelectListComponent,
    FormsModule,
    EbLoaderComponent,
    ToastComponent,
    EmHeaderComponent,
    NgxPermissionsAllowStubDirective
  ]
})
export class UserAdminEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  userAdminDetail: IUserAdmin;
  submitted: boolean;
  adminRoleValues: ISelect[];
  branches: ISelect[];
  adminUserId: string;
  searchText: string;
  filteredBranches: ISelect[];

  private readonly updateUrl: string;
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly fb = inject(FormBuilder);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly service = inject(UserAdminService);
  protected readonly messageService = inject(MessageService);
  protected readonly branchService = inject(BranchService);
  protected readonly adminService = inject(AdminUsersService);
  protected readonly router = inject(Router);

  constructor(
    location: Location,
    dialog: MatDialog
  ) {
    super(location, dialog);
    this.adminUserId = this.activatedRoute.snapshot.parent.params['adminUserId'];
    this.updateUrl = this.activatedRoute.snapshot.routeConfig.path;
  }

  get adminRoles(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  get branchArray(): FormArray {
    return this.form.get('branches') as FormArray;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.createForm();
    this.getBranches();
    this.getAdminRolesDictionary();
    if (this.adminUserId) {
      this.getAdminUsersById();
    }
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

  searchBranch(): void {
    if (this.searchText) {
      this.filteredBranches = this.branches.filter(x => x.name.toLowerCase().includes(this.searchText.toLowerCase()));
    } else {
      this.filteredBranches = this.branches
    }
  }

  checkAllBranches(event: Event): void {
    if ((<HTMLInputElement>event.target).checked) {
      this.branchArray.clear();
      this.branches.forEach(permission => {
        this.branchArray.push(this.fb.control(permission.id));
      })
    } else {
      this.branchArray.clear();
    }

  }

  branchSelect(id: string, e: any): void {
    const checkId = this.branchArray.value.findIndex((item: string) => item === id);
    if (!e.checked) {
      this.branchArray.removeAt(checkId);
    } else {
      this.branchArray.push(this.fb.control(id));
    }
  }

  private handleNewUserCreation(): void {
    this.performSave().pipe(
      switchMap(res => {
        if (!res?.status || !res.data) return of(null);
        return this.confirmAndSendLogin(res.data);
      }),
      filter(res => res !== null),
      switchMap(() => timer(1500)),
      tap(() => {
        this.back();
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private handleUserUpdate(): void {
    this.performSave().pipe(
      tap(res => {
        if (res?.status) {
          this.form.markAsPristine();
          this.router.navigate(['/user/admin']).catch();
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  private confirmAndSendLogin(userId: string): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetDialogComponent, {
      disableClose: true,
      panelClass: 'custom-modalbox',
      data: {
        title: 'Хотите отправить логин и пароль пользователю на электронную почту?'
      }
    });

    return dialogRef.afterClosed().pipe(
      switchMap((shouldSend: boolean) => {
        if (!shouldSend) {
          this.router.navigate(['/user/admin']).catch();
          return of(null);
        }

        return this.adminService.sendFirstLoginData({ id: userId }).pipe(
          tap(sendRes => {
            this.messageService.add({
              severity: sendRes.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
              summary: sendRes.message,
              life: 5000
            });
          })
        );
      })
    );
  }


  private showValidationError(): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: 'Неправильно заполнены данные!'
    });
  }

  private performSave(): Observable<any> {
    this.submitted = true;

    let $observer: Observable<any>;
    if (this.updateUrl !== 'new') {
      this.form.get('id').setValue(this.adminUserId);
      $observer = this.service.updateAdminUser({...this.userAdminDetail, ...this.form.value});
    } else {
      $observer = this.service.createAdminUser(this.form.value);
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

        return of(res).pipe(delay(2000));
      }),
      finalize(() => (this.submitted = false))
    );
  }

  private getAdminUsersById(): void {
    this.service.getAdminUserDetail(this.adminUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.form.patchValue(res.data);
        this.dataSource = res.data;
        res.data.branches.forEach(item => {
          this.branchArray.push(this.fb.control(item))
        })
        this.form.updateValueAndValidity();
      })
  }

  private getBranches(): void {
    this.branchService.getBranchDictionaryWithoutPagination()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.branches = res.data;
          this.filteredBranches = res.data;
        }
      })
  }

  private getAdminRolesDictionary(): void {
    this.service.getAdminRolesDictionary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.adminRoleValues = res.data;
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
      phoneNumber: ['', [Validators.required, PhoneValidator.validate()]],
      email: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        EskhataEmailValidator.validate()]],
      roles: this.fb.array([this.fb.control(null, Validators.required)]),
      branches: this.fb.array([],
        [Validators.required]),
      isActive: '',
    });
  }
}
