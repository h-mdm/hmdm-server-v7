import { inject, signal, WritableSignal } from '@angular/core';
import { catchError, forkJoin, Observable, of, take, tap } from 'rxjs';
import {
  ConfigurationService,
  TLinkConfigurationsToAppRequest,
  TLinkConfigurationsToAppVersionRequest,
} from '../../entity/configuration/services/configuration.service';
import { TAppConfigurationDTO } from '../../entity/configuration/types/app-configuration-dto.type';

export class ApplicationConfigFacadeService {
  private readonly configService = inject(ConfigurationService);
  private readonly _configurations: WritableSignal<TAppConfigurationDTO[]> = signal([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _saving = signal(false);

  configurations = this._configurations.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  saving = this._saving.asReadonly();

  initApplicationConfigurations(applicationId: number): void {
    console.log('applicationId', applicationId);
    this.loadConfigurations(applicationId);
  }

  /**
   * @param prefillFromApplicationId when set ("Auto Update" checked on a new version, as in v5),
   *        each configuration gets the action the application currently has in it
   */
  initVersionConfigurations(versionId: number, prefillFromApplicationId?: number) {
    console.log('versionId', versionId);
    this.loadVersionConfigurations(versionId, prefillFromApplicationId);
  }

  updateConfiguration(configId: number, updates: Partial<TAppConfigurationDTO>): void {
    this._configurations.update((configs) =>
      configs.map((config) =>
        config.configurationId === configId ? { ...config, ...updates, notify: true } : config,
      ),
    );
  }

  bulkUpdateConfigurations(selectedConfigIds: number[], action: number): void {
    this._configurations.update((configs) =>
      configs.map((config) =>
        selectedConfigIds.includes(config.configurationId)
          ? {
              ...config,
              action,
              remove: action === 2,
              notify: true,
            }
          : config,
      ),
    );
  }

  updateAllConfigurations(configurations: TAppConfigurationDTO[]): void {
    this._configurations.set(configurations);
  }

  saveConfigurations(applicationId: number): Observable<void> {
    this._saving.set(true);
    this._error.set(null);

    const request: TLinkConfigurationsToAppRequest = {
      applicationId,
      configurations: this._configurations(),
    };

    return this.configService.updateApplicationConfigurations(request).pipe(
      take(1),
      tap({
        next: () => {
          this._saving.set(false);
        },
        error: (error: any) => {
          this._saving.set(false);
          this._error.set(error.message || 'Failed to save configurations');
        },
      }),
    );
  }

  saveVersionConfigurations(versionId: number): Observable<void> {
    this._saving.set(true);
    this._error.set(null);

    const request: TLinkConfigurationsToAppVersionRequest = {
      applicationVersionId: versionId,
      // The backend replaces all links of the version with the posted ones,
      // so "do not install" (action 0) entries must not be sent
      configurations: this._configurations().filter((config) => config.action !== 0),
    };

    return this.configService.updateApplicationVersionConfigurations(request).pipe(
      take(1),
      tap({
        next: () => {
          this._saving.set(false);
        },
        error: (error: any) => {
          this._saving.set(false);
          this._error.set(error.message || 'Failed to save configurations');
        },
      }),
    );
  }

  private loadConfigurations(applicationId: number): void {
    this._loading.set(true);
    this._error.set(null);

    this.configService
      .getConfigurationsPerApp(applicationId)
      .pipe(take(1))
      .subscribe({
        next: (configs) => {
          // Store configurations as-is from API (preserve current action values)
          this._configurations.set(configs);
          this._loading.set(false);
        },
        error: (error: any) => {
          this._error.set('Failed to load configurations');
          this._loading.set(false);
          console.error('Error loading configurations:', error);
        },
      });
  }

  private loadVersionConfigurations(versionId: number, prefillFromApplicationId?: number): void {
    this._loading.set(true);
    this._error.set(null);

    // Without prefill, the current application links are not needed
    const appConfigs$ = prefillFromApplicationId
      ? this.configService.getConfigurationsPerApp(prefillFromApplicationId).pipe(
          // A failed prefill must not prevent the manual selection of configurations
          catchError((error: any) => {
            console.error('Error loading application configurations for auto update:', error);
            return of([] as TAppConfigurationDTO[]);
          }),
        )
      : of([] as TAppConfigurationDTO[]);

    forkJoin([this.configService.getConfigurationsPerVersion(versionId), appConfigs$])
      .pipe(take(1))
      .subscribe({
        next: ([versionConfigs, appConfigs]) => {
          console.log('Loaded version configurations:', versionConfigs);

          this._configurations.set(this.prefillActions(versionConfigs, appConfigs));
          this._loading.set(false);
        },
        error: (error: any) => {
          this._loading.set(false);
          console.error('Error loading configurations:', error);
        },
      });
  }

  // v5 "Auto Update": a new version is linked to no configuration ("Do not install" everywhere),
  // so copy the action the application has in each configuration and notify the devices
  // of every configuration actually using it. Nothing is saved until the user confirms.
  private prefillActions(
    versionConfigs: TAppConfigurationDTO[],
    appConfigs: TAppConfigurationDTO[],
  ): TAppConfigurationDTO[] {
    if (!appConfigs.length) {
      return versionConfigs;
    }

    const appActions = new Map(appConfigs.map((link) => [link.configurationId, link.action]));

    return versionConfigs.map((config) => {
      const action = appActions.get(config.configurationId);
      if (action === undefined) {
        return config;
      }
      return {
        ...config,
        action,
        remove: action === 2,
        notify: action !== 0,
      };
    });
  }
}
