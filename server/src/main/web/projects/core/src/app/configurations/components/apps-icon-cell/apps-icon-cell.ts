import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseCellRenderer, Selector, TOption } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { SHOW_ICON_OPTIONS } from '../../const/show-icon-options.const';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-apps-icon-cell',
  templateUrl: './apps-icon-cell.html',
  styleUrl: './apps-icon-cell.scss',
  imports: [Selector, ReactiveFormsModule],
})
export class AppsIconCell extends BaseCellRenderer<TApplicationDTO> implements OnInit {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  iconOptions: TOption<boolean>[] = SHOW_ICON_OPTIONS;
  formControl: FormControl<boolean> = new FormControl(true, { nonNullable: true });
  app: TApplicationDTO | null = null;

  ngOnInit(): void {
    this.app = this.params().data;

    if (!this.app) {
      return;
    }

    this.formControl.setValue(this.app.showIcon);

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      if (!this.app) {
        return;
      }
      this.configurationAppsFacadeService.setAppIcon(this.app, this.formControl.value);
    });
  }
}
