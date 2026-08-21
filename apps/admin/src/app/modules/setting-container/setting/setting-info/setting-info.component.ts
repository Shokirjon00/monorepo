import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { DestroyableComponent } from '@eskhata/util';
import { SettingService } from '@modules/setting-container/setting/services/setting.service';
import { ISetting } from '@modules/setting-container/setting/interfaces/setting.interface';
import { CommonModule } from '@angular/common';
import { DateTimePipe } from '@eskhata/util';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxPermissionsModule } from 'ngx-permissions';
import { HeaderService } from '@core/services/header.service';
import { IHeader } from '@eskhata/util';
import { ActionsComponent, EmHeaderComponent } from '@eskhata/ui';
import { IAction } from '@eskhata/util';
import { SettingInfoConstants } from "@modules/setting-container/setting/setting-info/setting-info.constants";

@Component({
  standalone: true,
  selector: 'em-setting-info',
  templateUrl: './setting-info.component.html',
  styleUrls: ['./setting-info.component.scss'],
  imports: [
    CommonModule,
    DateTimePipe,
    AngularSvgIconModule,
    NgxPermissionsModule,
    ActionsComponent,
    EmHeaderComponent
  ],
  providers: [SettingService]
})
export class SettingInfoComponent extends DestroyableComponent implements OnInit {
  settingDetail: ISetting;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(SettingService);
  private readonly store = inject(HeaderService);
  settingId = this.activatedRoute.snapshot.params['id'];
  actions: IAction[] = SettingInfoConstants.getActions(this.settingId)

  ngOnInit(): void {
    this.getSetting();
  }

  private getSetting(): void {
    this.service.getSettingDetail(this.settingId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        if (res.status) {
          this.settingDetail = res.data;
        }
      })
  }
}
