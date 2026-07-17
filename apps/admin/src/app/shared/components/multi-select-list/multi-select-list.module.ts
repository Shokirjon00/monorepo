import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MultiSelectListComponent} from '@shared/components/multi-select-list/multi-select-list.component';
import {AngularSvgIconModule} from 'angular-svg-icon';
import {ClickOutsideModule} from '@core/directives/click-outside/click-outside.module';
import {SharedModule} from '@shared/shared.module';

@NgModule({
    exports: [MultiSelectListComponent],
    imports: [
        CommonModule,
        AngularSvgIconModule,
        ClickOutsideModule,
        SharedModule,
        MultiSelectListComponent,
    ]
})
export class MultiSelectListModule { }
