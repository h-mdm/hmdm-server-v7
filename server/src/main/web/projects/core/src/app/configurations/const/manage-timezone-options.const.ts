import { TOption } from 'hmdm-ui-kit';

export const MANAGE_TIMEZONE_OPTIONS: TOption<string>[] = [
  { value: 'default', viewValue: 'form.configuration.settings.common.timezone.mode.default' },
  { value: 'auto', viewValue: 'form.configuration.settings.common.timezone.mode.auto' },
  { value: 'manual', viewValue: 'form.configuration.settings.common.timezone.mode.manual' },
];
