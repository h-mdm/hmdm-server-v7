import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseComponent, Checkbox, Selector, TextInputComponent } from 'hmdm-ui-kit';
import { ApplicationIconFormConfig } from '../../configuration/application-icon-form.config';
import { IconDialogService } from '../../services/icon-dialog.service';
import { IconFacadeService } from '../../services/icon-facade.service';
import { TApplicationIconFormValue } from '../../types/application-icon-form.type';

@Component({
  selector: 'core-application-icon-form',
  templateUrl: './application-icon-form.html',
  styleUrl: './application-icon-form.scss',
  imports: [
    ReactiveFormsModule,
    Selector,
    TextInputComponent,
    Checkbox,
    TranslatePipe,
    MatButtonModule,
    MatIcon,
  ],
})
export class ApplicationIconForm extends BaseComponent implements OnInit {
  initialValue: InputSignal<TApplicationIconFormValue | null> =
    input<TApplicationIconFormValue | null>(null);
  formChange: OutputEmitterRef<TApplicationIconFormValue | null> = output();

  private readonly iconDialogService = inject(IconDialogService);
  private readonly iconFacadeService = inject(IconFacadeService);
  private readonly applicationIconFormConfig = inject(ApplicationIconFormConfig);

  formGroup = this.applicationIconFormConfig.getFormGroup();
  iconsOptions = this.iconFacadeService.iconsOptions;
  isShowIcon: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    const initialValue = this.initialValue();

    if (initialValue) {
      this.formGroup.patchValue(initialValue);
      this.isShowIcon.set(!!initialValue.showIcon);
    }

    this.formGroup.controls.showIcon.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: (value) => {
        this.isShowIcon.set(!!value);
      },
    });

    this.formGroup.valueChanges.pipe(this.untilDestroyed()).subscribe({
      next: () => {
        const formValue = this.formGroup.valid ? this.formGroup.getRawValue() : null;
        this.formChange.emit(formValue);
      },
    });
  }

  onNewIconClick(): void {
    this.iconDialogService.openIconDialog();
  }
}
