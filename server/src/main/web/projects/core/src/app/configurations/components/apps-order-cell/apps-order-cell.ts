import { Component, inject, OnInit } from '@angular/core';
import { BaseCellRenderer, TextInputComponent } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';
import { ConfigurationAppsFacadeService } from '../../services/configuration-applications-facade.service';

@Component({
  selector: 'core-apps-order-cell',
  templateUrl: './apps-order-cell.html',
  styleUrl: './apps-order-cell.scss',
  imports: [TextInputComponent, ReactiveFormsModule],
})
export class AppsOrderCell extends BaseCellRenderer<TApplicationDTO> implements OnInit {
  private readonly configurationAppsFacadeService = inject(ConfigurationAppsFacadeService);

  formControl: FormControl<number | null> = new FormControl(null, { nonNullable: true });

  ngOnInit(): void {
    const app = this.params().data;

    this.formControl.setValue(app.screenOrder);

    this.formControl.valueChanges.pipe(this.untilDestroyed()).subscribe(() => {
      this.configurationAppsFacadeService.setAppOrder(app, this.formControl.value);
    });
  }

  isDisplayed(): boolean {
    const app = this.params().data;

    return app.action === 1 && app.showIcon;
  }
}
