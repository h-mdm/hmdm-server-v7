import { Component } from '@angular/core';
import {BaseCellRenderer} from 'hmdm-ui-kit';
import {TLicensesRestDTO} from '../../types/licenses-rest-dto.type';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'core-licenses-validity-cell',
  imports: [
    MatIcon
  ],
  templateUrl: './licenses-validity-cell.html',
  styleUrl: './licenses-validity-cell.scss',
})
export class LicensesValidityCell extends BaseCellRenderer<TLicensesRestDTO> {}
