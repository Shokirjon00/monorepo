import { Component, inject, OnInit } from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs";
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { IHeader } from "@core/interfaces";
import { HeaderService } from "@core/services";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  selector: 'em-pos-terminal-info',
  standalone: true,
  templateUrl: './pos-terminal-info.component.html',
  styleUrl: './pos-terminal-info.component.scss',
  providers: [PosTerminalService],
    imports: [
        NgxPermissionsModule,
        SvgIconComponent,
        EmHeaderComponent
    ],
})
export class PosTerminalInfoComponent extends DestroyableComponent implements OnInit {
  posTerminal: IPosTerminal;
  headerData: IHeader = {
    isFilter: false,
    tabShow: false
  };
  private readonly router = inject(Router);
  private readonly service = inject(PosTerminalService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly posTerminalId = this.activatedRoute.snapshot.parent?.params['posTerminalId'];
  private merchantId = this.activatedRoute.snapshot.queryParams['merchantId'];

  ngOnInit(): void {
    this.getDetail();
    this.initData();
  }

  navigateToInfo(): void {
    this.router.navigate(['/clients/merchant', this.merchantId, 'pos-terminal', this.posTerminalId, 'edit']).catch()
  }

  private getDetail(): void {
    this.service.getIBankPromotionById(this.posTerminalId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.posTerminal = res.data;
      })
  }

  private initData(): void {
    this.headerService.setAction([]);
    this.headerService.setHeader(this.headerData);
  }
}
