import { Directive, ElementRef, forwardRef, HostListener, inject, Renderer2 } from '@angular/core';
import { FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BACKSPACE,
  DELETE,
  LEFT_ARROW,
  NINE,
  NUMPAD_NINE,
  NUMPAD_ZERO,
  RIGHT_ARROW,
  TAB,
  ZERO
} from '@angular/cdk/keycodes';

@Directive({
  selector: '[emTimeMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeMaskDirective),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TimeMaskDirective),
      multi: true,
    },
  ],
  standalone: true
})
export class TimeMaskDirective {
  _onChange: (_: Date) => void;
  _touched: () => void;
  private _dateValue: Date;
  private _fieldJustGotFocus = false;

  private _el = inject(ElementRef, {self: true});
  private _renderer = inject(Renderer2);

  @HostListener('keydown', ['$event']) onKeyDown(evt: KeyboardEvent): void {
    const keyCode = evt.keyCode;
    switch (keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
      case TAB:
        this._decideWhetherToJumpAndSelect(keyCode, evt);
        break;

      case DELETE:
      case BACKSPACE:
        this._clearHoursOrMinutes();
        break;

      default:
        if ((keyCode >= ZERO && keyCode <= NINE) ||
          (keyCode >= NUMPAD_ZERO && keyCode <= NUMPAD_NINE)) {
          this._setInputText(evt.key);
        }
    }
    if (keyCode !== TAB) {
      evt.preventDefault();
    }
  }

  @HostListener('click', ['$event']) onClick(): void {
    this._fieldJustGotFocus = true;
    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  @HostListener('focus', ['$event']) onFocus(): void {
    this._fieldJustGotFocus = true;
    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  @HostListener('blur', ['$event']) onBlur(): void {
    this._touched();
  }

  _clearHoursOrMinutes(): void {
    const caretPosition = this._doGetCaretPosition();
    const input: string[] = this._el.nativeElement.value.split(':');

    const hours: string = input[0];
    const minutes: string = input[1];

    let newTime = '';
    let sendCaretToMinutes = false;

    if (caretPosition > 2) {
      newTime = `${hours}:--`;
      sendCaretToMinutes = true;
    } else {
      newTime = `--:${minutes}`;
      sendCaretToMinutes = false;
    }
    this._fieldJustGotFocus = true;
    this._renderer.setProperty(this._el.nativeElement, 'value', newTime);
    this._controlValueChanged();
    if (!sendCaretToMinutes) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
    }
  }

  writeValue(value: Date): void {
    this._dateValue = new Date(value);
    const v = value ? this._dateToStringTime(this._dateValue) : '--:--';
    this._renderer.setProperty(this._el.nativeElement, 'value', v);
  }

  registerOnChange(fn: (_: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._touched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._el.nativeElement, 'disabled', isDisabled);
  }

  validate(c: FormControl): { [key: string]: any } {
    return this._el.nativeElement.value.indexOf('-') === -1 ? null : {validTime: false};
  }

  private _decideWhetherToJumpAndSelect(keyCode: number, evt?: KeyboardEvent): void {

    const caretPosition = this._doGetCaretPosition();

    switch (keyCode) {
      case RIGHT_ARROW:
        this._el.nativeElement.setSelectionRange(3, 6);
        break;

      case LEFT_ARROW:
        this._el.nativeElement.setSelectionRange(0, 2);
        break;

      case TAB:
        if (caretPosition < 2 && !evt.shiftKey) {
          this._el.nativeElement.setSelectionRange(3, 6);
          evt.preventDefault();
        } else if (caretPosition > 2 && evt.shiftKey) {
          this._el.nativeElement.setSelectionRange(0, 2);
          evt.preventDefault();
        }
    }

    this._fieldJustGotFocus = true;
  }

  private _setInputText(key: string): void {
    const input: string[] = this._el.nativeElement.value.split(':');

    const hours: string = input[0];
    const minutes: string = input[1];

    const caretPosition = this._doGetCaretPosition();
    if (caretPosition < 3) {
      this._setHours(hours, minutes, key);
    } else {
      this._setMinutes(hours, minutes, key);
    }

    this._fieldJustGotFocus = false;
  }

  private _setHours(hours: string, minutes: string, key: string): void {
    const hoursArray: string[] = hours.split('');
    const firstDigit: string = hoursArray[0];
    const secondDigit: string = hoursArray[1];

    let newHour = '';

    let completeTime = '';
    let sendCaretToMinutes = false;

    if (firstDigit === '-' || this._fieldJustGotFocus) {
      newHour = `0${key}`;
      sendCaretToMinutes = Number(key) > 2;
    } else {
      newHour = `${secondDigit}${key}`;
      if (Number(newHour) > 23) {
        newHour = '23';
      }
      sendCaretToMinutes = true;
    }

    completeTime = `${newHour}:${minutes}`;

    this._renderer.setProperty(this._el.nativeElement, 'value', completeTime);
    this._controlValueChanged();
    if (!sendCaretToMinutes) {
      this._el.nativeElement.setSelectionRange(0, 2);
    } else {
      this._el.nativeElement.setSelectionRange(3, 6);
      this._fieldJustGotFocus = true;
    }
  }

  private _setMinutes(hours: string, minutes: string, key: string): void {
    const minutesArray: string[] = minutes.split('');
    const firstDigit: string = minutesArray[0];
    const secondDigit: string = minutesArray[1];

    let newMinutes = '';
    let completeTime = '';

    if (firstDigit === '-' || this._fieldJustGotFocus) {
      newMinutes = `0${key}`;
    } else {
      if (Number(minutes) === 59) {
        newMinutes = `0${key}`;
      } else {
        newMinutes = `${secondDigit}${key}`;
        if (Number(newMinutes) > 59) {
          newMinutes = '59';
        }
      }
    }

    completeTime = `${hours}:${newMinutes}`;

    this._renderer.setProperty(this._el.nativeElement, 'value', completeTime);
    this._controlValueChanged();
    this._el.nativeElement.setSelectionRange(3, 6);
  }

  private _doGetCaretPosition(): number {
    let iCaretPos = 0;
    const nativeElement = this._el.nativeElement;

    if (nativeElement.selectionStart || nativeElement.selectionStart === '0') {
      iCaretPos = nativeElement.selectionStart;
    }
    return iCaretPos;
  }

  private _zeroFill(value: number): string {
    return (value > 9 ? '' : '0') + value;
  }

  private _dateToStringTime(value: Date): string {
    return this._zeroFill(value.getHours()) + ':' + this._zeroFill(value.getMinutes());
  }

  private _stringToNumber(str: string): number {
    if (str.indexOf('-') === -1) {
      return Number(str);
    }
    const finalStr = str.replace('-', '0').replace('-', '0');
    return Number(finalStr);
  }

  private _controlValueChanged(): void {
    const timeArray: string[] = this._el.nativeElement.value.split(':');
    this._dateValue = new Date(this._dateValue.setHours(this._stringToNumber(timeArray[0])));
    this._dateValue = new Date(this._dateValue.setMinutes(this._stringToNumber(timeArray[1])));
    this._onChange(this._dateValue);
  }
}
