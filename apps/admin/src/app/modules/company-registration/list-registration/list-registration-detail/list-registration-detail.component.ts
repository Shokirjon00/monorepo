import { Component, inject } from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { ActivatedRoute, Params, RouterOutlet } from "@angular/router";
import { ToastComponent } from "@shared/components/toast/toast.component";
import { IHeader, ITab } from "@core/interfaces/header.interface";
import { IPaginate } from '@eskhata/util';
import { DestroyableComponent } from "@core/abstract/destroyable.component";
import { IAction } from "@shared/components/actions/actions.interface";
import { SharedModule } from "@shared/shared.module";
import {
  ListRegistrationDetailConstants
} from "@modules/company-registration/list-registration/list-registration-detail/list-registration-info.constants";

@Component({
  standalone: true,
  selector: 'em-list-registration-detail',
  templateUrl: './list-registration-detail.component.html',
  styleUrls: ['./list-registration-detail.component.scss'],
  imports: [
    SharedModule,
    NgxPermissionsModule,
    RouterOutlet,
    ToastComponent,
  ],
})
export class ListRegistrationDetailComponent extends DestroyableComponent {
  protected readonly listId: string | any;
  headerData: IHeader;
  page: IPaginate;
  tabMenuItems: ITab[]
  actions: IAction[]
  paginate: IPaginate | any;
  params: Params = {};
  private route = inject(ActivatedRoute);

  constructor() {
    super();
   this.listId = this.route.snapshot.parent.params['id'];
   this.tabMenuItems = ListRegistrationDetailConstants.getHeaderTabs(this.listId)
  }



}
