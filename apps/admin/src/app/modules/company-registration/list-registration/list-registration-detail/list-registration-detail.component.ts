import { Component, inject } from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { ActivatedRoute, Params, RouterOutlet } from "@angular/router";
import { ToastComponent } from "@eskhata/ui";
import { IHeader, ITab } from '@eskhata/util';
import { IPaginate } from '@eskhata/util';
import { DestroyableComponent } from '@eskhata/util';
import { IAction } from '@eskhata/util';
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
