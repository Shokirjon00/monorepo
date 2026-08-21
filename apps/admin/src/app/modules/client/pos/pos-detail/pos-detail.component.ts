import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { BreadcrumbService } from 'xng-breadcrumb';
import { PosService } from '@modules/client/pos/services/pos.service';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { DestroyableComponent } from '@eskhata/util';
import { IPosDetail } from '@modules/client/pos/interfaces/pos-detail.interface';
import { HeaderService } from '@core/services/header.service';

@Component({
  standalone: true,
  selector: 'em-pos-detail',
  template: '<router-outlet />',
  imports: [RouterOutlet],
  providers: [PosService]
})
export class PosDetailComponent extends DestroyableComponent implements OnInit {
  private breadcrumbService = inject(BreadcrumbService);
  private service = inject(PosService);
  private store = inject(HeaderService);
  private activatedRoute = inject(ActivatedRoute);
  posId = this.activatedRoute.snapshot.parent.params['posId']
  posDetail: IPosDetail

  ngOnInit(): void {
    this.getDetail();
    this.store.setPosId(this.posId)
  }

  private getDetail(): void {
    this.breadcrumbService.set('@posDetail', {skip: true});
    this.service.getDetail(this.posId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.posDetail = res.data;
        this.breadcrumbService.set('@posDetail', {label: this.posDetail.name, skip: false});
      })
  }
}
