import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { IClientRole } from '@modules/directory/client-role/interfaces/client-role.interface';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { ClientRoleService } from '@modules/directory/client-role/services/client-role.service';
import { MessageService } from '@core/services/message.service';
import { finalize, Observable, of, takeUntil } from 'rxjs';
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { setValidationErrors } from '@core/validators/set-validation-errors';
import { WhiteSpaceValidator } from '@core/validators/white-space-validator';
import { EMBaseForm } from '@core/abstract/base-form.abstract';
import { IParam } from '@core/interfaces/param.interface';
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { ValidatorComponent } from "@shared/components/validator/validator.component";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { IPermissions } from "@modules/directory/admin-role/interfaces/admin-role.interface";

@Component({
  standalone: true,
  selector: 'em-client-role-edit',
  templateUrl: './client-role-edit.component.html',
  styleUrls: ['./client-role-edit.component.scss'],
  providers: [ClientRoleService],
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
export class ClientRoleEditComponent extends EMBaseForm implements OnInit {
  form: FormGroup;
  clientRolesDetail: IClientRole;
  permissions: IPermissions[] = [];
  submitted: boolean = false;

  private readonly clientRoleId: string;
  private readonly updateUrl: string;
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClientRoleService);
  private readonly messageService = inject(MessageService);

  constructor(
    location: Location,
    dialog: MatDialog,
    route: ActivatedRoute,
  ) {
    super(location, dialog);
    this.clientRoleId = route.snapshot.params['id'];
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
    }
    else {
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
      id: [this.clientRoleId],
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
    this.service.getClientRolePermissionDictionary()
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res.status) {
            this.permissions = res.data;
            if (this.clientRolesDetail?.permissions?.length > 0) {
              this.setCheckedByIds(this.permissions, this.clientRolesDetail.permissions)
              this.updateParentChecked(this.permissions);
            }
          }
        });
  }

  private getDetail(): void {
    this.service.getClientRoleDetail(this.clientRoleId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          if (res.status) {
            this.clientRolesDetail = res.data;
            this.dataSource = res.data;
            this.form.patchValue(res.data);
            this.getPermissions();
          }
        });
  }
}
