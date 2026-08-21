import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { ClickOutsideModule } from '@eskhata/util';
import { MatDialogModule } from "@angular/material/dialog";
import {
  UserChangePasswordDialogComponent
} from "@shared/dialogs/user-change-password-dialog/user-change-password-dialog.component";
import { BottomSheetComponent, EskhataBankLoaderComponent, MapComponent, PasswordInputRulesComponent, SimpleSelectListComponent, ToastModule, ValidatorModule } from '@eskhata/ui';
import { SelectPeriodDialogComponent } from "@shared/dialogs/select-period-dialog/select-period-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { InfiniteScrollDirective } from "@eskhata/util";
import { RouterModule } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import {
  WithdrawalAmountSettingsDialogComponent
} from "@shared/dialogs/withdrawal-amount-settings-dialog/withdrawal-amount-settings-dialog.component";
import { PdfDialogComponent } from "@shared/dialogs/pdf-dialog/pdf-dialog.component";
import { PreventSpaceDirective } from "@core/directives/prevent-space.directive";
import { NgxPermissionsModule } from "ngx-permissions";
import { ScrollEventDirective } from '@core/directives/scroll-event.directive';

@NgModule({
    exports: [
        TransactionCardComponent,
        InfiniteScrollDirective,
        ScrollEventDirective,
        MapComponent,
        WithdrawalAmountSettingsDialogComponent,
        PreventSpaceDirective,
        BottomSheetComponent,
    ],
    imports: [
        CommonModule,
        AngularSvgIconModule,
        FormsModule,
        ClickOutsideModule,
        RouterModule,
        MatDialogModule,
        MatFormFieldModule,
        ValidatorModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatMomentDateModule,
        ToastModule,
        NgxPermissionsModule,
        PasswordInputRulesComponent,
        SimpleSelectListComponent,
        EskhataBankLoaderComponent,
        MapComponent,
        PdfDialogComponent,
        InfiniteScrollDirective,
        ScrollEventDirective,
        TransactionCardComponent,
        SelectPeriodDialogComponent,
        UserChangePasswordDialogComponent,
        WithdrawalAmountSettingsDialogComponent,
        PreventSpaceDirective,
        BottomSheetComponent,
    ]
})
export class SharedModule {
}
