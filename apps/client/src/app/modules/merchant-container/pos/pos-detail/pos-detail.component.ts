import { Component, inject, OnInit } from '@angular/core';
import { BreadcrumbService } from "xng-breadcrumb";
import { PosService } from "@modules/merchant-container/pos/services/pos.service";
import { HeaderService } from "@core/services/header.service";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { IPosDetail } from "@modules/merchant-container/pos/interfaces/pos.interface";
import { takeUntil } from "rxjs";
import { DestroyableComponent } from "@core/directives/destroyable.component";

@Component({
  standalone: true,
  selector: 'em-pos-detail',
  template: '<router-outlet />',
  imports: [
    RouterOutlet
  ],
  providers: [PosService]
})
export class PosDetailComponent  extends DestroyableComponent  implements OnInit{
  posDetail: IPosDetail

  private service = inject(PosService);
  private breadcrumbService = inject(BreadcrumbService);
  private store = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);

  posId = this.activatedRoute.snapshot.parent.params['posId']

  ngOnInit(): void {
    this.getDetail();
    this.store.setPosId(this.posId)
  }

  private getDetail(): void {
    this.breadcrumbService.set('@posDetail', {skip: true});
    this.service.getDetail(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status){
          this.posDetail = res.data;
          this.breadcrumbService.set('@posDetail', {label: this.posDetail.name, skip: false});
        }
      })
  }
}
