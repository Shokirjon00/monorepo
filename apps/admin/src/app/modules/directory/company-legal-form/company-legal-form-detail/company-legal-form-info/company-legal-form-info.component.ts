import { Component, inject, OnInit } from '@angular/core';
import { ICompanyLegalForm } from '@modules/directory/company-legal-form/interfaces/company-legal-form.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyLegalFormService } from '@modules/directory/company-legal-form/services/company-legal-form.service';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-company-legal-form-info',
  templateUrl: './company-legal-form-info.component.html',
  styleUrls: ['./company-legal-form-info.component.scss'],
  providers: [CompanyLegalFormService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class CompanyLegalFormInfoComponent extends DestroyableComponent implements OnInit {
  legalFormDetail: ICompanyLegalForm;

  private readonly router = inject(Router);
  private readonly service = inject(CompanyLegalFormService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private legalFormId = this.activatedRoute.snapshot.params['legalFormId'];

  ngOnInit(): void {
    this.service.getLegalFormById(this.legalFormId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.legalFormDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/legal-form/edit', this.legalFormId])
      .catch()
  }
}
