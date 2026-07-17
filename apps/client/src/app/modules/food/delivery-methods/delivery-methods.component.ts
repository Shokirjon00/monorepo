import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from "@angular/forms";
import { ValidatorModule } from "@shared/components/validator/validator.module";
import { EmHeaderComponent } from "@shared/components/em-header/em-header.component";
import { SvgIconComponent } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DeliveryMethodsService } from "@modules/food/delivery-methods/services/delivery-methods.service";
import { IDeliveryMethods } from "@modules/food/delivery-methods/interfaces/delivery-methods.interface";
import { MessageService } from "@core/services/message.service";
import { ToastEnum } from '@eskhata/util';
import { delay, mergeMap } from "rxjs/operators";
import { finalize, of } from "rxjs";
import { ToastModule } from "@shared/components/toast/toast.module";
import { EskhataBankLoaderComponent } from "@shared/components/eskhata-bank-loader/eskhata-bank-loader.component";

@Component({
  selector: 'em-delivery-methods',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ValidatorModule,
    EmHeaderComponent,
    SvgIconComponent,
    ToastModule,
    EskhataBankLoaderComponent
  ],
  templateUrl: './delivery-methods.component.html',
  styleUrl: './delivery-methods.component.scss',
  providers: [DeliveryMethodsService],
})

export class DeliveryMethodsComponent implements OnInit {
  form: FormGroup;
  deliveryMethods: IDeliveryMethods[] = [];
  submitted = signal(false);
  readonly restaurantDeliveryId = '6b342e13-51fb-4f3c-a868-3a3e2548bbaa';
  readonly taxiDeliveryId = '8bed1bf9-b7c8-4320-9c45-31d57dca7fca';
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(DeliveryMethodsService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.getDelivery();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.checkAndShowFormErrors()) {
      return;
    }

    this.submitted.set(true);

    const payload = this.preparePayload();

    this.sendPayload(payload);
  }

  getPriceControlName(deliveryTypeId: string): string {
    return `${deliveryTypeId}_price`;
  }

  onDeliveryChange(selectedMethodId: string): void {
    if (selectedMethodId === this.restaurantDeliveryId && this.form.get(selectedMethodId)?.value) {
      if (this.form.get(this.taxiDeliveryId)?.value) {
        this.form.get(this.taxiDeliveryId)?.setValue(false);
        this.messageService.add(this.MESSAGES.RESTAURANT_SELECTED);
      }
    } else if (selectedMethodId === this.taxiDeliveryId && this.form.get(selectedMethodId)?.value) {
      if (this.form.get(this.restaurantDeliveryId)?.value) {
        this.form.get(this.restaurantDeliveryId)?.setValue(false);
        this.messageService.add(this.MESSAGES.TAXI_SELECTED);
      }
    }
  }

  private getDelivery(): void {
    this.service
      .getDelivery()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        if (res.status) {
          this.deliveryMethods = res.data;
          this.buildForm(res.data);
        }
      });
  }

  private buildForm(data: IDeliveryMethods[]): void {
    const group: Record<string, any> = {};
    data.forEach((item) => {
      group[item.deliveryTypeId] = [item.isActive];

      if (item.deliveryTypeId === this.restaurantDeliveryId) {
        group[this.getPriceControlName(item.deliveryTypeId)] = [
          item.isActive && item.price ? item.price.amount : 0
        ];
      }
    });
    this.form = this.fb.group(group);
  }

  private preparePayload(): any[] {
    return this.deliveryMethods
      .filter(method => this.form.get(method.deliveryTypeId)?.value)
      .map(method => {
        if (method.deliveryTypeId === this.restaurantDeliveryId) {
          return {
            deliveryTypeId: method.deliveryTypeId,
            priceAmount:
              Number(this.form.get(this.getPriceControlName(method.deliveryTypeId))?.value) || 0,
          };
        }

        return {
          deliveryTypeId: method.deliveryTypeId,
        };
      });
  }

  private sendPayload(payload: any[]): void {
    this.service
      .updateDelivery(payload)
      .pipe(
        mergeMap(res => {
          this.messageService.add({
            severity: res.status ? ToastEnum.SUCCESS : ToastEnum.ERROR,
            summary: res.message || (res.status ? 'Успешно обновлено' : 'Ошибка при обновлении'),
          });

          return of(res).pipe(delay(res.status ? 2000 : 0));
        }),
        finalize(() => this.submitted.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(res => {
        if (res.status) {
          this.getDelivery();
        }
      });
  }

  private showErrorMessage(message: string): void {
    this.messageService.add({
      severity: ToastEnum.ERROR,
      summary: message,
    });
  }

  private checkAndShowFormErrors(): boolean {

    if (this.form.invalid) {
      const priceControl = this.form.get(this.getPriceControlName(this.restaurantDeliveryId));
      if (priceControl?.errors?.['min']) {
        this.showErrorMessage('Стоимость доставки не может быть отрицательной!');
        return true;
      }

      this.showErrorMessage('Неправильно заполнены данные!');
      return true;
    }

    return false;
  }

  private readonly MESSAGES = {
    RESTAURANT_SELECTED: {
      severity: ToastEnum.WARN,
      summary: 'Доставка по такси отключена',
      detail: 'При выборе доставки из ресторана доставка по такси автоматически отключается'
    },
    TAXI_SELECTED: {
      severity: ToastEnum.WARN,
      summary: 'Доставка из ресторана отключена',
      detail: 'При выборе доставки по такси доставка из ресторана автоматически отключается'
    }
  };
}
