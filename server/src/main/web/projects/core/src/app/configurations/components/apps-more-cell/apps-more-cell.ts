import { Component, inject } from '@angular/core';
import { BaseCellRenderer, MatButtonModule, MatIconModule } from 'hmdm-ui-kit';
import { TApplicationDTO } from '../../../entity/application/types/application-dto.type';
import { ConfigurationApplicationDialogService } from '../../services/configuration-application-dialog.service';

@Component({
  selector: 'core-apps-more-cell',
  templateUrl: './apps-more-cell.html',
  styleUrl: './apps-more-cell.scss',
  imports: [MatButtonModule, MatIconModule],
})
export class AppsMoreCell extends BaseCellRenderer<TApplicationDTO> {
  private readonly configurationApplicationDialogService = inject(
    ConfigurationApplicationDialogService,
  );

  openApplicationDialog(): void {
    const app = this.params().data;
    this.configurationApplicationDialogService.openEditDialog(app);
  }
}
