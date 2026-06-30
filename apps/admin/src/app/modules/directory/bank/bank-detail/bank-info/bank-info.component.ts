import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IBankDetail } from '@modules/directory/bank/interfaces/bank-detail.intefrace';
import { BankService } from '@modules/directory/bank/services/bank.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { CompanyService } from "@modules/client/company/services/company.service";
import { loadFile } from "@core/utils/load-file";
import { HelperService } from "@core/services/helper.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs/operators";
import { from } from "rxjs";

@Component({
  standalone: true,
  selector: 'em-bank-info',
  templateUrl: './bank-info.component.html',
  styleUrls: ['./bank-info.component.scss'],
  providers: [BankService, CompanyService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class BankInfoComponent implements OnInit {
  iconFileStorageId: string;
  bankDetail: IBankDetail;
  fileStorageUrl: string;
  fileStorageToken: string;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(BankService);
  private readonly destroyRef = inject(DestroyRef);
  private helperService = inject(HelperService);
  bankId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.loadBankDetail();
  }

  navigateToBankUpdate(): void {
    this.router.navigate(['directory/bank/edit', this.bankId]).catch();
  }

  private getUploadLoginMain(fileStorageUrl: string, imageID: string, fileStorageToken: string): void {
    this.helperService.getFile(fileStorageUrl, imageID, fileStorageToken).pipe(
      switchMap(res => from(loadFile(res.body))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(file => {
      this.iconFileStorageId = file;
    });
  }

  private loadBankDetail(): void {
    this.service.getBankById(this.bankId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.bankDetail = res.data;
          if (this.bankDetail.iconFileStorageId) {
            this.getUploadLoginMain(
              res.meta.fileStorageUrl,
              this.bankDetail.iconFileStorageId,
              res.meta.fileStorageToken
            );
          }
        }
      });
  }
}
