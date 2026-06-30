import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { ClickOutsideModule } from "@core/directives/click-outside/click-outside.module";
import { MatDialogModule } from "@angular/material/dialog";
import {
  UserChangePasswordDialogComponent
} from "@shared/dialogs/user-change-password-dialog/user-change-password-dialog.component";
import { ToastModule } from "@shared/components/toast/toast.module";
import { SelectPeriodDialogComponent } from "@shared/dialogs/select-period-dialog/select-period-dialog.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { InfiniteScrollDirective } from "@core/directives/infinite-scroll.directive";
import { ValidatorModule } from "@shared/components/validator/validator.module";
import { MapComponent } from "@shared/components/map/map.component";
import { RouterModule } from "@angular/router";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import {
  WithdrawalAmountSettingsDialogComponent
} from "@shared/dialogs/withdrawal-amount-settings-dialog/withdrawal-amount-settings-dialog.component";
import { PdfDialogComponent } from "@shared/dialogs/pdf-dialog/pdf-dialog.component";
import { PreventSpaceDirective } from "@core/directives/prevent-space.directive";
import { NgxPermissionsModule } from "ngx-permissions";
import { PasswordInputRulesComponent } from '@shared/components/password-input-rules/password-input-rules.component';
import { BottomSheetComponent } from '@shared/components/bottom-sheet/bottom-sheet.component';
import { ScrollEventDirective } from '@core/directives/scroll-event.directive';
import { SimpleSelectListComponent } from "@shared/components/simple-select-list/simple-select-list.component";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";

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
