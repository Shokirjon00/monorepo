import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollDirective } from '@core/directives/infinite-scroll.directive';
import { MapComponent } from './components/map/map.component';
import { PhoneMaskDirective } from '@core/directives/phone-mask.directive';
import { PreventSpaceDirective } from '@core/directives/space-false.directive';
import { ChangeOrderStatusComponent } from './dialogs/change-order-status/change-order-status.component';
import { SimpleSelectListComponent } from '@shared/components/simple-select-list/simple-select-list.component';
import {
  ErrorOrderStatusDialogComponent
} from './dialogs/error-order-status-dialog/error-order-status-dialog.component';
import { EbLoaderComponent } from '@shared/components/eb-loader/eb-loader.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ValidatorComponent } from '@shared/components/validator/validator.component';


@NgModule({
    exports: [
        CommonModule,
        EbLoaderComponent,
        ValidatorComponent,
        SimpleSelectListComponent,
        ToastComponent,
        InfiniteScrollDirective,
        MapComponent,
        PhoneMaskDirective,
        PreventSpaceDirective,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ToastComponent,
        SimpleSelectListComponent,
        ValidatorComponent,
        EbLoaderComponent,
        MapComponent,
        InfiniteScrollDirective,
        PhoneMaskDirective,
        PreventSpaceDirective,
        ChangeOrderStatusComponent,
        ErrorOrderStatusDialogComponent,
    ],
})
export class SharedModule {
}
