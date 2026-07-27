import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { BaseControlValueAccessor } from '../../shared/base/control-value-accessor';
import { ErrorMessage } from '../error-message/error-message';
import { HelpTooltip } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'hmdm-timepicker',
  templateUrl: './timepicker.html',
  styleUrls: ['../controls-style.scss', './timepicker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatTimepickerModule,
    ErrorMessage,
    HelpTooltip,
  ],
})
export class Timepicker extends BaseControlValueAccessor<any> {}
