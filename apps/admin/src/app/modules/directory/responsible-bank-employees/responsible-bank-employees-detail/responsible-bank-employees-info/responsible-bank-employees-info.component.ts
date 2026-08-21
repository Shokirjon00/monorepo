import { Component, inject, OnInit } from '@angular/core';
import { DestroyableComponent } from '@eskhata/util';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { IResBankEmp } from '@modules/directory/responsible-bank-employees/interfaces/res-bank-emp.interface';
import { ResBankEmpService } from '@modules/directory/responsible-bank-employees/services/res-bank-emp.service';
import { NgxPermissionsModule } from "ngx-permissions";
import { SvgIconComponent } from "angular-svg-icon";
import { EmHeaderComponent } from '@eskhata/ui';

@Component({
  standalone: true,
  selector: 'em-responsible-bank-employees-info',
  templateUrl: './responsible-bank-employees-info.component.html',
  styleUrls: ['./responsible-bank-employees-info.component.scss'],
  providers: [ResBankEmpService],
  imports: [
    NgxPermissionsModule,
    SvgIconComponent,
    EmHeaderComponent
  ]
})
export class ResponsibleBankEmployeesInfoComponent extends DestroyableComponent implements OnInit {
  resBankEmpDetail: IResBankEmp;
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(ResBankEmpService);

  private resBankEmployeeId = this.activatedRoute.snapshot.params['id'];

  ngOnInit(): void {
    this.service.getResBankEmpById(this.resBankEmployeeId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.resBankEmpDetail = res.data;
      });
  }

  navigate(): void {
    this.router.navigate(['directory/res-bank-emp/edit', this.resBankEmployeeId])
      .catch()
  }
}
