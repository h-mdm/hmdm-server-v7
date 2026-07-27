import { TApplication } from './application.type';
import { TPhoneFile } from './phone-file.type';

export type TDeviceInfo = {
  permissions: number[];
  kioskMode: boolean;
  androidVersion: string;
  batteryLevel: number;
  defaultLauncher: boolean;
  deviceId: string;
  imei: string;
  mdmMode: boolean;
  model: string;
  serial: string;
  applications: TApplication[];
  files: TPhoneFile[];
};
