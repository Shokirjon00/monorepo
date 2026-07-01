import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { combineLatest } from "rxjs";
import { HeaderService, MessageService } from "@core/services";
import { ActivatedRoute } from "@angular/router";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IPosTerminalSettingInterface } from "@modules/client/pos-terminal-setting/interfaces/pos-terminal-setting.interface";
import { PosTerminalSettingService } from "@modules/client/pos-terminal-setting/services/pos-terminal-setting.service";
import { ToastEnum } from '@eskhata/util';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { PosTerminalsConstants } from "@modules/client/pos-terminal/pos-terminals.constants";
import { ITab } from "@core/interfaces/header.interface";
import { IAction } from "@shared/components/actions/actions.interface";
import { ClientConstants } from "@modules/client/client.constants";
import { ActionsComponent } from "@shared/components/actions/actions.component";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SvgIconComponent } from "angular-svg-icon";
import { NgxPermissionsModule } from "ngx-permissions";

@Component({
  selector: 'em-pos-terminal-setting',
  standalone: true,
  templateUrl: './pos-terminal-setting.component.html',
  styleUrl: './pos-terminal-setting.component.scss',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ToastComponent,
    ActionsComponent,
    EmHeaderComponent,
    ToastComponent,
    SvgIconComponent,
    NgxPermissionsModule
  ],
  providers: [PosTerminalSettingService]
})
export class PosTerminalSettingComponent implements OnInit {
  terminalSettings: IPosTerminalSettingInterface[];
  hasShift = new FormControl(false);
  tabMenuItems: ITab[];
  actions: IAction[];
  companyId: string;
  merchantId: string;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store = inject(HeaderService);
  private readonly posTerminalSettingService = inject(PosTerminalSettingService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.companyId = this.activatedRoute.snapshot.parent.parent.params['companyId'];
    this.merchantId = this.activatedRoute.snapshot.parent.parent.params['merchantId'];
  }

  ngOnInit(): void {
    this.getMerchantComponent();
    this.getShift();
    this.initTabData();
    this.store.setAction(null);
    this.store.getDialog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res === 'merchant-dialog') {
          const selectedComponent = this.terminalSettings?.find(item => item.isSelected);
          if (selectedComponent && this.merchantId) {
            const payload = {
              componentId: selectedComponent.componentId,
              merchantId: this.merchantId,
            };
            this.saveMerchantComponent(payload);
          }
        }
      })
  }

  onToggle(selectedId: string): void {
    this.terminalSettings = this.terminalSettings.map((item) => ({
      ...item,
      isSelected: item.componentId === selectedId,
    }));
  }

  saveSelectedMerchantComponent(): void {
    const selectedItem = this.terminalSettings?.find(item => item.isSelected);

    if (!selectedItem) {
      this.messageService.add({
        severity: ToastEnum.ERROR,
        summary: 'Выберите компонент главного экрана'
      });
      return;
    }

    const payload = {
      componentId: selectedItem.componentId,
      merchantId: this.merchantId
    };

    this.saveMerchantComponent(payload);
  }

  saveMerchantComponent(payload: { componentId: string, merchantId: string }): void {
    this.posTerminalSettingService.updateMerchantComponents(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message});
        }
      });
  }

  sendActive(): void {
    const payload = {
      hasShift: this.hasShift.value,
      merchantId: this.merchantId,
    };
    this.posTerminalSettingService.updateShift(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.messageService.add({ severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR, summary: res.message });
        }
      });
  }

  private initTabData(): void {
    combineLatest([
      this.store.getCompanyId(),
      this.store.getMerchantId()
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([companyId, merchantId]) => {
        this.companyId = companyId;
        this.merchantId = merchantId;
        this.getTabItems();
      });
  }

  private getTabItems(): void {
    if (this.companyId) {
      this.tabMenuItems = PosTerminalsConstants.getPosHeaderTabs(this.companyId, this.merchantId)
    } else if (this.merchantId) {
      this.tabMenuItems = PosTerminalsConstants.getPosHeader(this.merchantId);
    } else {
      this.tabMenuItems = ClientConstants.HEADERS_TABS
    }
  }

  private getMerchantComponent(): void {
    this.posTerminalSettingService.getMerchantsComponents(this.merchantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.terminalSettings = res.data;
        }
      })
  }

  private getShift(): void {
    this.posTerminalSettingService.getShift(this.merchantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.status) {
          this.hasShift.setValue(res.data.hasShift);
        }
      });
  }
}
