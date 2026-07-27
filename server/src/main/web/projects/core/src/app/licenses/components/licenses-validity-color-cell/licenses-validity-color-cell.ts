import {Component} from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';

@Component({
  selector: 'core-licenses-validity-color-cell',
  imports: [],
  templateUrl: './licenses-validity-color-cell.html',
  styleUrl: './licenses-validity-color-cell.scss',
})
export class LicensesValidityColorCell extends BaseCellRenderer<TLicensesRestDTO> {
}
