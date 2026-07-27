import { Component, inject, OnInit } from '@angular/core';
import { DialogBase, DialogCommonButtons, DialogTemplate, MAT_DIALOG_DATA } from 'hmdm-ui-kit';
import { TaskFormConfig } from '../../config/task-form.config';
import { TaskForm } from '../task-form/task-form';

@Component({
  selector: 'push-task-dialog',
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
  imports: [DialogTemplate, DialogCommonButtons, TaskForm],
})
export class TaskDialog extends DialogBase implements OnInit {
  private readonly taskFormConfig = inject(TaskFormConfig);
  private readonly data = inject(MAT_DIALOG_DATA);

  formGroup = this.taskFormConfig.getFormGroup();

  ngOnInit(): void {
    if (this.data) {
      console.log('Patching form with data:', this.data);

      this.formGroup.patchValue(this.data, { emitEvent: false });
    }
  }

  override onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.formGroup.getRawValue());
  }
}
