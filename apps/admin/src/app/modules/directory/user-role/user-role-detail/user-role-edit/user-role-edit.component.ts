import { Component, inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from '@core/services/message.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ToastEnum } from '@eskhata/util';
import { ISelect } from '@core/interfaces/select.interface';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { UsersRoleService } from "@modules/directory/user-role/services/users-role.service";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { IUserRole } from "@modules/directory/user-role/interfaces/user-role.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-user-role-edit',
  templateUrl: './user-role-edit.component.html',
  styleUrls: ['./user-role-edit.component.scss'],
  providers: [UsersRoleService],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    FormsModule,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class UserRoleEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  clientRolesDetail: IUserRole;
  permissions: ISelect[] = [];
  filterPermissions: ISelect[];
  submitted: boolean = false;
  searchText: string;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsersRoleService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private clientRoleId = this.activatedRoute.snapshot.params['id'];
  private updateUrl = this.activatedRoute.snapshot.routeConfig.path;

  constructor(
    location: Location,
    dialog: MatDialog,
  ) {
    super(location, dialog);
  }

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();
    this.getPermissions();
    if (this.updateUrl !== 'new') {
      this.getDetail()
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;

    let $observer: Observable<any>;

    if (this.updateUrl !== 'new') {
      $observer = this.service.updateClientRole({...this.clientRolesDetail, ...this.form.value});
    } else {
      $observer = this.service.createClientRole(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
          if (res.status) {
            this.form.reset();
            this.back()
          } else {
            setValidationErrors(this.form, res);
          }
        }
      );
  }

  search(): void {
    if (this.searchText) {
      this.filterPermissions = this.permissions.filter(x => x.name.toLowerCase().includes(this.searchText.toLowerCase()));
    } else {
      this.filterPermissions = this.permissions.slice()
    }
  }

  permissionSelect(id: string, e: any): void {
    const checkId = this.permissionsArray.value.findIndex((item: string) => item === id);
    if (!e.checked) {
      this.permissionsArray.removeAt(checkId);
    } else {
      this.permissionsArray.push(this.fb.control(id));
    }
  }

  checkAllPermission(event: Event): void {
    if ((<HTMLInputElement>event.target).checked) {
      this.permissionsArray.clear();
      this.permissions.forEach(permission => {
        this.permissionsArray.push(this.fb.control(permission.id));
      })
    } else {
      this.permissionsArray.clear();
    }

  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.clientRoleId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      description: [''],
      permissions: this.fb.array([],
        Validators.required),
      isActive: [false]
    });
  }

  private getPermissions(): void {
    this.service.getClientRolePermissionDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.permissions = res.data
          this.filterPermissions = this.permissions.slice()
        }
      })
  }

  private getDetail(): void {
    this.service.getClientRoleDetail(this.clientRoleId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.clientRolesDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          this.clientRolesDetail.permissions.forEach(item => {
            this.permissionsArray.push(this.fb.control(item))
          })
        }
      });
  }

}
