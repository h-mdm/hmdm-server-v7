import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { ConfigurationAppSettingsForm } from '../configuration-app-settings-form/configuration-app-settings-form';
import { ConfigurationAppSettingsFormConfig } from '../../configs/configuration-app-settings-form.config';

@Component({
  selector: 'core-configuration-app-settings-dialog',
  templateUrl: './configuration-app-settings-dialog.html',
  styleUrl: './configuration-app-settings-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, ConfigurationAppSettingsForm],
})
export class ConfigurationAppSettingsDialog extends DialogBase implements OnInit {
  private readonly configurationAppSettingsForm = inject(ConfigurationAppSettingsFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.configurationAppSettingsForm.getFormGroup();

  ngOnInit(): void {
    if (this.data) {
      this.formGroup.patchValue(this.data);
    }
  }

  override onSave(): void {
    this.dialogRef.close(this.formGroup.getRawValue());
  }
}
