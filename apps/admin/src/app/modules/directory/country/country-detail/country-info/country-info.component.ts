import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@core/abstract/destroyable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ICountryDetail } from '@modules/directory/country/interfaces/country-detail.interface';
import { CountryService } from '@modules/directory/country/services/country.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";

@Component({
  standalone: true,
  selector: 'em-country-info',
  templateUrl: './country-info.component.html',
  styleUrls: ['./country-info.component.scss'],
  providers: [CountryService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class CountryInfoComponent extends DestroyableComponent implements OnInit {
  countryDetail: ICountryDetail;

  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(CountryService);
  private countryId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getCountryById(this.countryId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.countryDetail = res.data;
      });
  }

  navigateToUpdate(): void {
    this.router.navigate(['directory/country/edit', this.countryId])
      .catch()
  }
}
