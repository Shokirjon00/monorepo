import { Component, inject, OnInit } from '@angular/core';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { DestroyableComponent } from '@eskhata/util';
import {
  IDirectoryOptionsDetail
} from "@modules/directory/directory-options/interfaces/directory-options-detail.interfaces";
import { ActivatedRoute, Router } from "@angular/router";
import { DirectoryOptionsService } from "@modules/directory/directory-options/services/directory-options.service";
import { finalize, takeUntil } from "rxjs";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-directory-options-info',
  templateUrl: './directory-options-info.component.html',
  styleUrls: ['./directory-options-info.component.scss'],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ],
})
export class DirectoryOptionsInfoComponent extends DestroyableComponent implements OnInit {
  loading: boolean;
  directoryOptionsDetail: IDirectoryOptionsDetail;
  captionKey = 'directory-options-info';

  private readonly router = inject(Router);
  private readonly service = inject(DirectoryOptionsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private directoryOptionsId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.loading = true
    this.service.getDirectoryOptionsById(this.directoryOptionsId)
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroyed$)
      )
      .subscribe(res => {
        this.directoryOptionsDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/directory-options/edit', this.directoryOptionsId])
      .catch()
  }
}
