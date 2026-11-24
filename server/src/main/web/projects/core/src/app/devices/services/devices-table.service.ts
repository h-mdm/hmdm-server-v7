import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from 'hmdm-ui-kit';
import { filter, take } from 'rxjs';
import { DevicesService } from '../../entity/device/services/devices.service';
import { DevicesFormDialog } from '../components/devices-form-dialog/devices-form-dialog';
import { TDevice } from '../types/device.type';
import { DevicesFacadeService } from './devices-facade.service';
import { SettingsFacadeService } from '../../shared/services/settings-facade.service';
import { LicenseService } from '../../auth/services/license.service';

@Injectable({ providedIn: 'root' })
export class DevicesTableService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly deviceFacadeService = inject(DevicesFacadeService);
  private readonly deviceService = inject(DevicesService);
  private readonly settingsFacadeService = inject(SettingsFacadeService);
  private readonly licenseService = inject(LicenseService);

  openEditDialog(device: TDevice): void {
    const id = device.id;
    if (!id) {
      console.error('Device ID is missing. Cannot open edit dialog.');
      return;
    }

    if (!device.oldNumber) {
      this.openEditDialogFor(device, id);
      return;
    }

    // The number change may have been completed since the list was loaded: refresh its state
    this.deviceService
      .getDeviceByNumber(device.number)
      .pipe(take(1))
      .subscribe({
        next: (response) =>
          this.openEditDialogFor(
            response.status === 'OK' ? { ...device, oldNumber: response.data?.oldNumber ?? null } : device,
            id,
          ),
        error: () => this.openEditDialogFor(device, id),
      });
  }

  private openEditDialogFor(device: TDevice, id: number): void {
    const dialogRef = this.dialog.open(DevicesFormDialog, {
      data: device,
      minWidth: '400px',
    });

    dialogRef
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe((result) => {
        // Changing the number of an enrolled device requires a migration:
        // the device keeps requesting the config by the old number until it gets the new one
        if (!device.oldNumber && result.number !== device.number && device.lastUpdate > 0) {
          this.dialog
            .open(ConfirmDialog, {
              data: {
                message: 'form.device.migration.warning',
                confirmButtonText: 'button.yes',
                cancelButtonText: 'button.cancel',
              },
            })
            .afterClosed()
            .pipe(take(1), filter(Boolean))
            .subscribe(() => this.deviceFacadeService.updateDevice(result, id, device.number));
          return;
        }
        this.deviceFacadeService.updateDevice(result, id, device.oldNumber ?? null);
      });
  }

  openDeleteConfirmDialog(deviceId: TDevice): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.device',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            deviceNumber: deviceId.number ?? '',
          },
        },
      })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() =>
        this.deviceService
          .delete(deviceId.id!)
          .pipe(take(1))
          .subscribe(() => {
            this.deviceFacadeService.searchDevices({ force: true });
            this.settingsFacadeService.fetchSettings().subscribe();
            this.licenseService.refreshLicenses();
          }),
      );
  }
}
