import { TOption } from 'hmdm-ui-kit';

export const INSTALLATION_STATUS_OPTIONS: TOption<string>[] = [
  {
    viewValue: 'form.devices.selection.install.status.success',
    value: 'success',
  },
  {
    viewValue: 'form.devices.selection.install.status.version.mismatch',
    value: 'version_mismatch',
  },
  {
    viewValue: 'form.devices.selection.install.status.failure',
    value: 'failure',
  },
];
