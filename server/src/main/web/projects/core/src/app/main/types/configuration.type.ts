import { TApplication } from './application.type';
import { TPhoneFile } from './phone-file.type';

export type TConfiguration = {
  qrCodeKey: string;
  id: number;
  name: string;
  baseUrl: string;
  applications: TApplication[];
  files: TPhoneFile[];
};
