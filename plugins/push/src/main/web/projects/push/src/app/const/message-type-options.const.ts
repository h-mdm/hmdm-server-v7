import { TOption } from 'hmdm-ui-kit';

export const MESSAGE_TYPE_OPTIONS: TOption<string>[] = [
  { value: 'configUpdated', viewValue: 'configUpdated' },
  { value: 'runApp', viewValue: 'runApp' },
  { value: 'uninstallApp', viewValue: 'uninstallApp' },
  { value: 'deleteFile', viewValue: 'deleteFile' },
  { value: 'deleteDir', viewValue: 'deleteDir' },
  { value: 'purgeDir', viewValue: 'purgeDir' },
  { value: 'permissiveMode', viewValue: 'permissiveMode' },
  { value: 'intent', viewValue: 'intent' },
  { value: 'runCommand', viewValue: 'runCommand' },
  { value: 'reboot', viewValue: 'reboot' },
  { value: 'exitKiosk', viewValue: 'exitKiosk' },
  { value: 'clearDownloadHistory', viewValue: 'clearDownloadHistory' },
  { value: 'grantPermissions', viewValue: 'grantPermissions' },
  { value: '(custom)', viewValue: '(custom)' },
];
