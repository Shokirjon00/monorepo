import { Component, inject, Input, OnInit } from '@angular/core';
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { NgxPermissionsModule } from "ngx-permissions";
import { AllowListConstants } from "@modules/advance-payments/allow-list/allow-list-info/allow-list.constants";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { UploadFieldComponent } from "@shared/components/upload-field/upload-field.component";
import { CompanyService } from "@modules/client/company/services/company.service";
import { AllowListService } from "@modules/advance-payments/allow-list/service/allow-list.service";

@Component({
  selector: 'em-allow-list-info',
  standalone: true,
  imports: [
    EmHeaderComponent,
    ActionsComponent,
    NgxPermissionsModule,
    ReactiveFormsModule,
    UploadFieldComponent
  ],
  templateUrl: './allow-list-info.component.html',
  styleUrl: './allow-list-info.component.scss',
  providers: [CompanyService]
})
export class AllowListInfoComponent extends DestroyableComponent implements OnInit {
  @Input() uploadFile = {
    fileType: '.jpg, .jpeg', memType: 'application/pdf', uploadPath: 'advance_payout_offers/upload'
  };
  fileStorageUrl: string;
  fileStorageToken: string;
  allowListDetail: any;
  form: FormGroup;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(AllowListService);
  private readonly fb = inject(FormBuilder);

  private id = this.activatedRoute.snapshot.params['id'];
  actions: IAction[] = AllowListConstants.getActions(this.id)


  ngOnInit(): void {
    this.form = this.fb.group({contractFileId: ''});
    this.getDetail()
  }

  navigate(): void {
    this.router.navigate(['advance/allow-list/edit', this.id]).catch();
  }

  private getDetail(): void {
    this.service.getAdvancePayoutById(this.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.allowListDetail = res.data;
        this.fileStorageUrl = res.meta.fileStorageUrl;
        this.fileStorageToken = res.meta.fileStorageToken;
        this.form.patchValue(res.data, {emitEvent: false})
      })
  }

}
