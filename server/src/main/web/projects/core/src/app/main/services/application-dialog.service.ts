import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog, InformDialog } from 'hmdm-ui-kit';
import { catchError, filter, finalize, of, switchMap, take, takeUntil } from 'rxjs';
import { SnackBarService } from '../../shared/services/snack-bar.service';
import { EApplicationType } from '../../entity/application/enum/application-type.enum';
import { ApplicationService } from '../../entity/application/services/application.service';
import { TApplicationDTO } from '../../entity/application/types/application-dto.type';
import { TApplicationFormEmitValue } from '../types/application-form.type';
import { ApplicationConfigDialog } from '../components/application-config-dialog/application-config-dialog';
import { ApplicationDialog } from '../components/application-dialog/application-dialog';
import {
  DuplicatePkgDialog,
  TDuplicatePkgDialogResult,
} from '../components/duplicate-pkg-dialog/duplicate-pkg-dialog';
import { ApplicationFacadeService } from './application-facade.service';

@Injectable({ providedIn: 'root' })
export class ApplicationDialogService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly applicationService = inject(ApplicationService);
  private readonly applicationFacadeService = inject(ApplicationFacadeService);
  private readonly snackBarService = inject(SnackBarService);

  openAddApplicationDialog(): void {
    const dialogRef = this.dialog.open(ApplicationDialog, { minWidth: '600px' });
    const instance = dialogRef.componentInstance;

    instance.saveTrigger$
      .pipe(
        takeUntil(dialogRef.beforeClosed()),
        switchMap((data) => {
          instance.isSaving.set(true);
          return this.resolveAndSave(data, true).pipe(
            catchError(() => of(null)),
            finalize(() => instance.isSaving.set(false)),
          );
        }),
      )
      .subscribe((res) => {
        if (!res) return;

        if ('__nameTaken' in res) {
          instance.nameError.set('error.app.name.exists');
          return;
        }

        dialogRef.close();
        this.applicationFacadeService.searchApplications();

        if (!this.applicationFacadeService.formData?.showSystem && res.system) {
          this.openSystemAppMessageDialog();
        }

        const applicationId = 'applicationId' in res ? res.applicationId : res.id;
        const versionId = 'applicationId' in res ? res.id : res.usedVersionId;
        this.openSelectConfigurationDialog(applicationId, versionId);
      });
  }

  openEditApplicationDialog(application: TApplicationDTO): void {
    const dialogRef = this.dialog.open(ApplicationDialog, { minWidth: '600px', data: application });
    const instance = dialogRef.componentInstance;

    instance.saveTrigger$
      .pipe(
        takeUntil(dialogRef.beforeClosed()),
        switchMap((data) => {
          instance.isSaving.set(true);
          return this.resolveAndSave(data, false).pipe(
            catchError(() => of(null)),
            finalize(() => instance.isSaving.set(false)),
          );
        }),
      )
      .subscribe((res) => {
        if (!res || '__nameTaken' in res) return;

        dialogRef.close();
        this.applicationFacadeService.searchApplications();
      });
  }

  private resolveAndSave(data: TApplicationFormEmitValue, isNewApp: boolean) {
    if (data.type !== EApplicationType.APP || !data.filePath) {
      return this.applicationService.createApplication(data);
    }

    const appData = data;
    const validateBody = {
      arch: appData.arch || null,
      type: appData.type,
      pkg: appData.pkg,
      name: appData.name,
      version: appData.version,
      versionCode: appData.versionCode ?? 0,
      filePath: appData.filePath,
      runAtBoot: appData.runAtBoot,
      runAfterInstall: appData.runAfterInstall,
      showIcon: appData.showIcon,
      system: appData.system,
      autoUpdateDisplayed: true,
    };

    return this.applicationService.validatePkg(validateBody).pipe(
      switchMap((duplicates) => {
        if (!duplicates?.length) {
          return this.applicationService.createApplication(data);
        }

        // Single match and version is new → silently add a new version
        if (duplicates.length === 1 && !appData.versionExists) {
          return this.applicationService.createApplicationVersion({
            applicationId: duplicates[0].id,
            version: appData.version,
            arch: appData.arch || null,
            filePath: appData.filePath,
            versionCode: appData.versionCode,
            pkg: appData.pkg,
            name: appData.name,
            type: appData.type,
            runAtBoot: appData.runAtBoot,
            runAfterInstall: appData.runAfterInstall,
            showIcon: appData.showIcon,
            system: appData.system,
            autoUpdateDisplayed: true,
          });
        }

        return this.dialog
          .open(DuplicatePkgDialog, {
            minWidth: '480px',
            data: {
              duplicateApps: duplicates,
              pkg: appData.pkg,
              appName: appData.name,
              isNewApp,
            },
          })
          .afterClosed()
          .pipe(
            switchMap((result: TDuplicatePkgDialogResult | null) => {
              if (!result) return of(null);

              if (result.action === 'name-taken') {
                return of({ __nameTaken: true } as const);
              }

              if (result.action === 'new-version') {
                return this.applicationService.createApplicationVersion({
                  applicationId: result.applicationId,
                  version: appData.version,
                  arch: appData.arch || null,
                  filePath: appData.filePath,
                  versionCode: appData.versionCode,
                  pkg: appData.pkg,
                  name: appData.name,
                  type: appData.type,
                  runAtBoot: appData.runAtBoot,
                  runAfterInstall: appData.runAfterInstall,
                  showIcon: appData.showIcon,
                  system: appData.system,
                  autoUpdateDisplayed: true,
                });
              }

              // 'new-app' or 'change-pkg' — proceed with normal application creation
              return this.applicationService.createApplication(data);
            }),
          );
      }),
    );
  }

  openSelectConfigurationDialog(applicationId: number, versionId?: number): void {
    this.dialog
      .open(ApplicationConfigDialog, { data: { applicationId, versionId } })
      .afterClosed()
      .pipe(take(1), filter(Boolean))
      .subscribe(() => {
        this.applicationFacadeService.searchApplications();
      });
  }

  openDeleteApplicationDialog(application: TApplicationDTO): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: '',
          message: 'question.delete.application',
          confirmButtonText: 'button.delete',
          cancelButtonText: 'button.cancel',
          params: {
            applicationName: application.name,
          },
        },
      })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.applicationService.deleteApplication(application.id)),
      )
      .subscribe(() => {
        this.applicationFacadeService.searchApplications();
      });
  }

  openSystemAppMessageDialog(): void {
    this.dialog.open(InformDialog, {
      data: {
        message: 'alerts.system.apps.filter',
      },
    });
  }
}
