import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { MessageService } from '@eskhata/data-access';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ToastEnum, WhiteSpaceValidator } from '@eskhata/util';
import { IAdminRole, IPermissions } from '@modules/directory/admin-role/interfaces/admin-role.interface';
import { AdminRoleService } from '@modules/directory/admin-role/services/admin-role.service';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@eskhata/util';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { EmHeaderComponent, ToastComponent, ValidatorComponent } from '@eskhata/ui';
import { IHttpResponse } from "@core/interfaces/http-response.interface";

@Component({
  standalone: true,
  selector: 'em-admin-role-edit',
  templateUrl: './admin-role-edit.component.html',
  styleUrls: ['./admin-role-edit.component.scss'],
  providers: [AdminRoleService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SvgIconComponent,
    NgxPermissionsModule,
    ValidatorComponent,
    FormsModule,
    ToastComponent,
    EmHeaderComponent
  ]
})
export class AdminRoleEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  adminRolesDetail: IAdminRole;
  permissions: IPermissions[] = [];
  submitted: boolean = false;

  private readonly roleId: string;
  private readonly updateUrl: string;
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AdminRoleService);
  private readonly messageService = inject(MessageService);

  constructor(
    dialog: MatDialog,
    location: Location,
    route: ActivatedRoute,
  ) {
    super(location, dialog);

    this.roleId = route.snapshot.parent.params['roleId'];
    this.updateUrl = route.snapshot.routeConfig.path;
  }

  get permissionsArray(): FormArray {
    return this.form.get('permissions') as FormArray;
  }

  get visibleItems(): IPermissions[] {
    return this.permissions.filter(item => !item.isHidden);
  }

  @Input() set data(value: IParam) {
    this.dataSource = value;
  }

  ngOnInit(): void {
    this.creatForm();

    if (this.updateUrl !== 'new') {
      this.getDetail();
    } else {
      this.getPermissions();
    }
  }

  onSubmit(): void {
    const selectedIds: string[] = this.getCheckedIds(this.permissions);

    this.permissionsArray.clear();
    selectedIds.forEach(id => this.permissionsArray.push(this.fb.control(id)));

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({severity: ToastEnum.ERROR, summary: 'Неправильно заполнены данные!'});
      return null;
    }
    this.submitted = true;

    let $observer: Observable<IHttpResponse<string>>;
    if (this.updateUrl !== 'new') {
      $observer = this.service.updateAdminRole({...this.adminRolesDetail, ...this.form.value});
    } else {
      $observer = this.service.createAdminRole(this.form.value);
    }

    $observer
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message
          });
          return of(res).pipe(delay(res.status ? 2000 : 0))
        }),
        finalize(() => this.submitted = false),
        takeUntil(this.destroyed$)
      )
      .subscribe((res) => {
        if (res.status) {
          this.form.reset();
          this.router.navigate(['directory/admin-roles']).catch();
        } else {
          setValidationErrors(this.form, res);
        }
      });
  }

  search(event: KeyboardEvent): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();

    const filterTree = (nodes: IPermissions[], parents: IPermissions[]): boolean => {
      let hasMatch = false;

      for (const node of nodes) {
        const matches = inputValue.length > 0 && node.name.toLowerCase().includes(inputValue);
        let childHasMatch = false;

        if (node.childs?.length) {
          childHasMatch = filterTree(node.childs, [...parents, node]);
        }

        if (matches || childHasMatch) {
          hasMatch = true;
          node.isHidden = false;
          parents.forEach(parent => parent.isHidden = false);
        } else {
          node.isHidden = inputValue.length !== 0;
        }
      }

      return hasMatch;
    };

    filterTree(this.permissions, []);
  }

  permissionSelect(node: IPermissions, e: Event): void {
    const isChecked = (<HTMLInputElement>e.target).checked;
    node.checked = isChecked;

    if (node.permissions?.length) {
      this.setChildrenChecked(node.permissions, isChecked);
    }
    if (node.childs?.length) {
      this.setChildrenChecked(node.childs, isChecked);
    }

    this.updateParentChecked(this.permissions);
  }

  isAllChecked(): boolean {
    const checkNodes = (nodes: IPermissions[]): boolean => {
      for (const node of nodes) {
        if (!node.checked) return false;
        if (node.childs?.length && !checkNodes(node.childs)) return false;
      }
      return true;
    };

    return checkNodes(this.permissions);
  }

  toggleAllPermission(event: Event): void {
    const isChecked = (<HTMLInputElement>event.target).checked;
    this.setChildrenChecked(this.permissions, isChecked);
  }

  private setChildrenChecked(nodes: IPermissions[], isChecked: boolean): void {
    for (const child of nodes) {
      child.checked = isChecked;
      if (child.permissions?.length) {
        this.setChildrenChecked(child.permissions, isChecked);
      }

      if (child.childs?.length) {
        this.setChildrenChecked(child.childs, isChecked);
      }
    }
  }

  private updateParentChecked(nodes: IPermissions[]): void {
    for (const node of nodes) {
      if (node.childs?.length) {
        this.updateParentChecked(node.childs);
      }
      const allPermissionsChecked = node.permissions?.every(p => p.checked) ?? true;
      const allChildsChecked = node.childs?.every(child => child.checked) ?? true;
      node.checked = allPermissionsChecked && allChildsChecked;
    }
  }

  private getCheckedIds(nodes: IPermissions[]): string[] {
    let ids: string[] = [];

    for (const node of nodes) {
      if (node.permissions?.length) {
        ids = ids.concat(node.permissions.filter(p => p.checked).map(p => p.id));
      }

      if (node.childs?.length) {
        ids = ids.concat(this.getCheckedIds(node.childs));
      }
    }

    return ids;
  }

  private creatForm(): void {
    this.form = this.fb.group({
      id: [this.roleId],
      name: ['', [Validators.required,
        WhiteSpaceValidator.validate(),
        Validators.maxLength(100)]],
      description: [''],
      permissions: this.fb.array([],
        [Validators.required]),
      isActive: [false]
    });
  }

  private setCheckedByIds(nodes: IPermissions[], selectedIds: string[]): void {
    for (const node of nodes) {
      node.checked = selectedIds.includes(node.id);

      if (node.permissions?.length) {
        node.permissions.forEach(p => {
          p.checked = selectedIds.includes(p.id);
        });
      }

      if (node.childs?.length) {
        this.setCheckedByIds(node.childs, selectedIds);
      }
    }
  }

  private getPermissions(): void {
    this.service.getAdminRolePermissionDictionary()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.permissions = res.data;
          if (this.adminRolesDetail?.permissions?.length > 0) {
            this.setCheckedByIds(this.permissions, this.adminRolesDetail.permissions)
            this.updateParentChecked(this.permissions);
          }
        }
      });
  }

  private getDetail(): void {
    this.service.getAdminRoleDetail(this.roleId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.adminRolesDetail = res.data;
          this.dataSource = res.data;
          this.form.patchValue(res.data);
          this.getPermissions();
        }
      });
  }
}
