import { Component, input, InputSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['../controls-style.scss', './text-input.component.scss'],
  providers: [provideNgxMask()],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInputModule,
    NgxMaskDirective,
    ErrorMessage,
    HelpTooltip,
  ],
})
export class TextInputComponent extends BaseControlValueAccessor<string> {
  optionalValidationKey: InputSignal<string> = input<string>('');
  maxLengthNum: InputSignal<number> = input<number>(524288);
  inputType: InputSignal<string> = input<string>('text');
  placeholder: InputSignal<string> = input<string>('');
  mask: InputSignal<string | null> = input<string | null>(null);
}
