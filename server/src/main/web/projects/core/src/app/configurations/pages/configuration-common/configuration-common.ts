import { ChangeDetectionStrategy, Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Checkbox,
  Radio,
  Selector,
  TextAreaInputComponent,
  TextInputComponent,
  TranslatePipe,
  Slider,
  Timepicker,
  BaseComponent,
} from 'hmdm-ui-kit';
import { BOOLEAN_RADIO_OPTIONS } from '../../../shared/const/boolean-radio-options.const';
import { ConfigurationCommonFormConfig } from '../../configs/configuration-common-form.config';
import { BRIGHTNESS_RADIO_OPTIONS } from '../../const/brightness-radio.const';
import { UPDATE_RADIO_OPTIONS } from '../../const/update-radio.const';
import { TRACKING_OPTIONS } from '../../const/tracking-options.const';
import { PERMISSIONS_OPTIONS } from '../../const/permissions-options.const';
import { NOTIFICATIONS_OPTIONS } from '../../const/notifications-options.const';
import { KEEPALIVE_OPTIONS } from '../../const/keepalive-options.const';
import { MANAGE_TIMEZONE_OPTIONS } from '../../const/manage-timezone-options.const';
import { PASSWORD_OPTIONS } from '../../const/password-options.const';
import { DOWNLOAD_OPTIONS } from '../../const/download-options.const';
import { TConfigurationCommonFormValue } from '../../types/configuration-common-form.type';
import { SYSTEM_RADIO_OPTIONS } from '../../const/system-radio.const';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';

@Component({
  selector: 'core-configuration-common',
  templateUrl: './configuration-common.html',
  styleUrl: './configuration-common.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    TranslatePipe,
    TextAreaInputComponent,
    Selector,
    Checkbox,
    Radio,
    Slider,
    Timepicker,
  ],
})
export class ConfigurationCommon extends BaseComponent implements OnInit {
  private readonly configurationCommonFormConfig = inject(ConfigurationCommonFormConfig);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);

  formGroup = this.configurationCommonFormConfig.getFormGroup();
  commonRadioOptions = BOOLEAN_RADIO_OPTIONS;
  brightnessRadioOptions = BRIGHTNESS_RADIO_OPTIONS;
  systemRadioOptions = SYSTEM_RADIO_OPTIONS;
  updateRadioOptions = UPDATE_RADIO_OPTIONS;
  trackingOptions = TRACKING_OPTIONS;
  permissionsOptions = PERMISSIONS_OPTIONS;
  notificationOptions = NOTIFICATIONS_OPTIONS;
  keepaliveOptions = KEEPALIVE_OPTIONS;
  manageTimezoneOptions = MANAGE_TIMEZONE_OPTIONS;
  passwordOptions = PASSWORD_OPTIONS;
  downloadOptions = DOWNLOAD_OPTIONS;

  get formValue(): TConfigurationCommonFormValue {
    return this.formGroup.getRawValue();
  }

  constructor() {
    super();

    effect(() => {
      const currentConfig = this.configurationDetailsFacadeService.currentConfiguration();

      if (currentConfig) {
        this.formGroup.patchValue(
          {
            ...currentConfig,
            usbStorage: currentConfig.usbStorage ?? false,
            passwordMode: currentConfig.passwordMode ?? 'DISABLED',
            runDefaultLauncher: currentConfig.runDefaultLauncher ?? false,
          },
          { emitEvent: false },
        );
      }
    });
  }

  ngOnInit(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationDetailsFacadeService.setConfigurationCommonValue(this.formValue);
    });
  }

  getPushMessageHelpText(formValue: TConfigurationCommonFormValue): string {
    if (formValue.pushOptions === 'mqttAlarm') {
      return 'form.configuration.settings.push.options.mqtt.alarm.hint';
    } else if (formValue.pushOptions === 'polling') {
      return 'form.configuration.settings.push.options.polling.hint';
    }

    return '';
  }
}
