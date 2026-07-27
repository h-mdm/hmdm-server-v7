import { Component, effect, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseComponent, Checkbox, Selector, TextInputComponent, TranslatePipe } from 'hmdm-ui-kit';
import { DesktopOptionsService } from '../../../shared/services/desktop-options.service';
import { ConfigurationDesignFormConfig } from '../../configs/configuration-design-form.config';
import { ICON_SIZE_OPTIONS } from '../../const/icon-size-options.const';
import { ORIENTATION_OPTIONS } from '../../const/orientation-options.const';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';
import { TConfigurationDesignFormValue } from '../../types/configuration-design-form.type';

@Component({
  selector: 'core-configuration-design',
  templateUrl: './configuration-design.html',
  styleUrl: './configuration-design.scss',
  imports: [ReactiveFormsModule, Checkbox, TextInputComponent, Selector, TranslatePipe],
})
export class ConfigurationDesign extends BaseComponent implements OnInit {
  private readonly configurationDesignFormConfig = inject(ConfigurationDesignFormConfig);
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);
  private readonly desktopOptionsService = inject(DesktopOptionsService);

  iconSizeOptions = ICON_SIZE_OPTIONS;
  desktopOptions = this.desktopOptionsService.desktopOptions;
  orientationOptions = ORIENTATION_OPTIONS;
  formGroup = this.configurationDesignFormConfig.getFormGroup();

  get formValue(): TConfigurationDesignFormValue {
    return this.formGroup.getRawValue();
  }

  constructor() {
    super();

    effect(() => {
      const config = this.configurationDetailsFacadeService.currentConfiguration();

      if (config) {
        this.formGroup.patchValue(config);
      }
    });
  }

  ngOnInit(): void {
    this.initFormListeners();
  }

  private initFormListeners(): void {
    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationDetailsFacadeService.setConfigurationDesign(this.formValue);
    });

    this.formGroup.controls.useDefaultDesignSettings.valueChanges
      .pipe(this.untilDestroyed())
      .subscribe((useDefault) => {
        if (useDefault) {
          this.formGroup.controls.backgroundColor.disable();
          this.formGroup.controls.textColor.disable();
          this.formGroup.controls.backgroundImageUrl.disable();
          this.formGroup.controls.iconSize.disable();
          this.formGroup.controls.orientation.disable();

          this.formGroup.controls.backgroundColor.reset();
          this.formGroup.controls.textColor.reset();
          this.formGroup.controls.backgroundImageUrl.reset();
          this.formGroup.controls.iconSize.reset();
          this.formGroup.controls.orientation.reset();
        } else {
          this.formGroup.controls.backgroundColor.enable();
          this.formGroup.controls.textColor.enable();
          this.formGroup.controls.backgroundImageUrl.enable();
          this.formGroup.controls.iconSize.enable();
          this.formGroup.controls.orientation.enable();
        }
      });
  }
}
