import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BaseCellRenderer, Selector, TOption } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-apps-action-cell',
  templateUrl: './apps-action-cell.html',
  styleUrl: './apps-action-cell.scss',
  imports: [Selector, ReactiveFormsModule],
})
export class AppsActionCell extends BaseCellRenderer<TApplicationDTO> implements OnInit {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  actionOptions: WritableSignal<TOption<number>[]> = signal([]);
  formControl: FormControl<number> = new FormControl(1, { nonNullable: true });

  ngOnInit(): void {
    const app = this.params().data;
    this.actionOptions.set(this.configurationAppsFacadeService.getActionOptions(app));

    this.formControl.setValue(app.action);

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationAppsFacadeService.setAppAction(app, this.formControl.value);
    });
  }
}
