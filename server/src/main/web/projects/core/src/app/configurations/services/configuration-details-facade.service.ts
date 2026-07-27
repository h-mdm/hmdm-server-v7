import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ConfigurationService } from '../../entity/configuration/services/configuration.service';
import { TAppSettingsDTO } from '../../entity/configuration/types/app-settings-dto.type';
import { TConfigurationDTO } from '../../entity/configuration/types/configuration-dto.type';
import { TConfigurationFileDTO } from '../../entity/configuration/types/configuration-file-dto.type';
import { TConfigurationCommonFormValue } from '../types/configuration-common-form.type';
import { TConfigurationDesignFormValue } from '../types/configuration-design-form.type';
import { TConfigurationMDMFormValue } from '../types/configuration-mdm-form.type';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationDetailsFacadeService {
  private readonly configurationService = inject(ConfigurationService);
  private readonly _configurationId: WritableSignal<number | null> = signal(null);
  private readonly _currentConfiguration: WritableSignal<TConfigurationDTO | null> = signal(null);
  private readonly _reloadTrigger: WritableSignal<number> = signal(0);
  private readonly router: Router = inject(Router);

  private configurationCommonValue: TConfigurationCommonFormValue | null = null;
  private configurationDesignValue: TConfigurationDesignFormValue | null = null;
  private configurationMDMValue: TConfigurationMDMFormValue | null = null;

  currentConfiguration = this._currentConfiguration.asReadonly();
  configurationId = this._configurationId.asReadonly();
  reloadTrigger = this._reloadTrigger.asReadonly();
  appSettings: Signal<TAppSettingsDTO[]> = computed(() => {
    const config = this._currentConfiguration();

    if (config) {
      return config.applicationSettings || [];
    }

    return [];
  });

  configurationFiles: Signal<TConfigurationFileDTO[]> = computed(() => {
    const config = this._currentConfiguration();

    if (config) {
      return config.files || [];
    }

    return [];
  });

  setCurrentConfigurationId(id: number | null): void {
    this._configurationId.set(id);
    this._reloadTrigger.update((v) => v + 1);

    if (id) {
      this.configurationService.getConfigurationsById(id).subscribe((config) => {
        this._currentConfiguration.set(config);
      });
    } else {
      this._currentConfiguration.set(null);
    }
  }

  setConfigurationCommonValue(formValue: TConfigurationCommonFormValue): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      this.configurationCommonValue = formValue;

      return {
        ...config,
        ...formValue,
      };
    });
  }

  setConfigurationDesign(formValue: TConfigurationDesignFormValue): void {
    this.configurationDesignValue = formValue;
  }

  setMDMSettings(formValue: TConfigurationMDMFormValue): void {
    this.configurationMDMValue = formValue;
  }

  addAppSetting(appSetting: TAppSettingsDTO): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const settings = [...(config.applicationSettings || [])];
      if (appSetting.id) {
        const index = settings.findIndex((s) => s.id === appSetting.id);
        if (index !== -1) {
          settings[index] = appSetting;
        }
      } else {
        settings.push(appSetting);
      }

      return {
        ...config,
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        applicationSettings: settings,
      };
    });
  }

  deleteAppSetting(id: number): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const settings = config.applicationSettings || [];
      const updatedSettings = settings.filter((s) => s.id !== id);

      return {
        ...config,
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        applicationSettings: updatedSettings,
      };
    });
  }

  addFile(file: TConfigurationFileDTO): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const files = [...(config.files || []), file];

      return {
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        ...config,
        files,
      };
    });
  }

  deleteFile(fileId: number): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const files = config.files || [];
      const updatedFiles = files.filter((f) => f.id !== fileId);

      return {
        ...config,
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        files: updatedFiles,
      };
    });
  }

  getUpdatedConfiguration(): TConfigurationDTO | null {
    const currentConfig = this._currentConfiguration();

    if (!currentConfig) {
      return null;
    }

    return {
      ...currentConfig,
      ...this.configurationCommonValue,
      ...this.configurationDesignValue,
      ...this.configurationMDMValue,
    };
  }

  getNewConfiguration(): any {
    if (!this.configurationCommonValue) {
      return null;
    }

    const newApp = {
      ...this.configurationCommonValue,
      ...this.configurationDesignValue,
      ...this.configurationMDMValue,
      eventReceivingComponent: 'com.hmdm.launcher.AdminReceiver',
      defaultFilePath: '/',
      type: 0,
      applicationSettings: [],
      files: [],
    };

    // Remove empty string values from newApp
    Object.keys(newApp).forEach((key) => {
      if (
        newApp[key as keyof typeof newApp] === '' ||
        newApp[key as keyof typeof newApp] === null
      ) {
        delete newApp[key as keyof typeof newApp];
      }
    });

    return newApp;
  }

  saveConfiguration(configuration: TConfigurationDTO): void {
    this.configurationService
      .updateConfiguration(configuration)
      .pipe(take(1))
      .subscribe(() => {
        this.router.navigate(['home', 'configurations']);
      });
  }

  updateFile(file: TConfigurationFileDTO): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const files = [...(config.files || []).map((f) => (f.id === file.id ? file : f))];

      return {
        ...config,
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        files,
      };
    });
  }

  removeFileChange(id: number, value: boolean): void {
    this._currentConfiguration.update((config) => {
      if (!config) {
        return config;
      }

      const files = config.files || [];
      const updatedFiles = files.map((file) => {
        if (file.id === id) {
          return {
            ...file,
            remove: value,
          };
        }
        return file;
      });

      return {
        ...config,
        ...this.configurationCommonValue,
        ...this.configurationDesignValue,
        ...this.configurationMDMValue,
        files: updatedFiles,
      };
    });
  }
}
