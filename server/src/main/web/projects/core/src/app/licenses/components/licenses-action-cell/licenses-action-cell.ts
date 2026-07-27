import {Component, inject} from '@angular/core';
import {LicensesRestService} from '../../services/licenses-rest.service';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {HasPermissionDirective} from '../../../shared/directives/has-permission.directive';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'core-licenses-action-cell',
  imports: [
    HasPermissionDirective,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './licenses-action-cell.html',
  styleUrl: './licenses-action-cell.scss',
})
export class LicensesActionCell extends BaseCellRenderer<TLicensesRestDTO> {
  private readonly licensesService = inject(LicensesRestService);

  onDeleteClick(): void {
    const license = this.params().data;

    if (!license) {
      return;
    }

    this.licensesService.deleteLicense(license.id);
  }
}
