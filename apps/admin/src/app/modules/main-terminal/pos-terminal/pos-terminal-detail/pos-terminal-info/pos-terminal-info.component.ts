import { Component, inject, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbsComponent } from "@shared/components/breadcrumbs/breadcrumbs.component";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";
import { PosTerminalService } from "@modules/main-terminal/pos-terminal/services/pos-terminal.service";
import { IPosTerminal } from "@modules/main-terminal/pos-terminal/interfaces/pos-terminal.interface";

@Component({
  standalone: true,
  selector: 'em-shifts-info',
  templateUrl: './pos-terminal-info.component.html',
  styleUrls: ['./pos-terminal-info.component.scss'],
  imports: [
    BreadcrumbsComponent,
    SvgIconComponent,
    NgxPermissionsModule,
    ],
  providers: [PosTerminalService]
})
export class PosTerminalInfoComponent extends DestroyableComponent implements OnInit {
  posTerminal: IPosTerminal;
  private readonly posTerminalId;
  private readonly router = inject(Router);
  private readonly service = inject(PosTerminalService);

  constructor(
    route: ActivatedRoute
  ) {
    super()
    this.posTerminalId = route.snapshot.parent.params['posTerminalId']
  }

  ngOnInit(): void {
    this.getDetail();
  }

  navigateToInfo(): void {
    this.router.navigate(['/main-terminal/pos-terminal', this.posTerminalId, 'edit']).catch()
  }

  private getDetail(): void {
    this.service.getIBankPromotionById(this.posTerminalId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.posTerminal = res.data;
        }
      })
  }
}
