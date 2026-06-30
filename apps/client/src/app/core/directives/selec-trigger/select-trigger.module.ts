import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SelectTriggerDirective} from "@core/directives/selec-trigger/select-trigger.directive";



@NgModule({
    exports: [
        SelectTriggerDirective
    ],
    imports: [
        CommonModule,
        SelectTriggerDirective
    ]
})
export class SelectTriggerModule { }
