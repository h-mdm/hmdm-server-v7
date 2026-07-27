import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import {
  Checkbox,
  DateRange,
  PersistFormDirective,
  Selector,
  TextInputComponent,
  TTableConfig,
} from 'hmdm-ui-kit';
import { DeviceTableConfig } from '../../configuration/devices-table.config';
import { SearchDevicesFormConfig } from '../../configuration/search-devices-form.config';
import { DEVICE_STATUS_OPTIONS } from '../../const/device-status-options.const';
import { DEVICE_TIME_OPTIONS } from '../../const/device-time-options.const';
import { INSTALLATION_STATUS_OPTIONS } from '../../const/installation-status-options.const';
import { KIOSK_MODE_OPTIONS } from '../../const/kiosk-mode-options.const';
import { MDM_MODE_OPTIONS } from '../../const/mdm-mode-options.const';
import { DevicesFacadeService } from '../../services/devices-facade.service';
import { TSearchDevicesForm } from '../../types/devices-form.type';

@Component({
  selector: 'core-devices-form',
  templateUrl: './devices-form.html',
  styleUrl: './devices-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Selector,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TextInputComponent,
    DateRange,
    Checkbox,
    TranslatePipe,
    PersistFormDirective,
  ],
})
export class DevicesForm implements OnInit {
  showMore: InputSignal<boolean> = input<boolean>(false);
  valueChange: OutputEmitterRef<any> = output<any>();

  private readonly devicesFacadeService = inject(DevicesFacadeService);
  private readonly deviceTableConfig = inject(DeviceTableConfig);
  private readonly deviceFormConfig = inject(SearchDevicesFormConfig);

  groups = this.devicesFacadeService.groups;
  configurations = this.devicesFacadeService.configurations;
  kioskModeOptions = KIOSK_MODE_OPTIONS;
  mdmModeOptions = MDM_MODE_OPTIONS;
  statusOptions = DEVICE_STATUS_OPTIONS;
  timeOptions = DEVICE_TIME_OPTIONS;
  installationStatusOptions = INSTALLATION_STATUS_OPTIONS;

  tableConfig: TTableConfig = this.deviceTableConfig.getConfig();
  devicesForm: FormGroup<TSearchDevicesForm> = this.deviceFormConfig.getFormGroup();

  ngOnInit(): void {
    this.devicesForm.valueChanges.subscribe(() => {
      this.valueChange.emit(this.devicesForm.getRawValue());
    });
  }
}
