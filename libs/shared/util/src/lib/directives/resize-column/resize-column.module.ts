import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ResizeColumnDirective} from './resize-column.directive';



@NgModule({
    exports: [
        ResizeColumnDirective
    ],
    imports: [
        CommonModule,
        ResizeColumnDirective
    ]
})
export class ResizeColumnModule { }
