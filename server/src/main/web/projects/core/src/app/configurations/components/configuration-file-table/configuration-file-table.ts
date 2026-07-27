import { Component, effect, inject } from '@angular/core';
import { Table } from 'hmdm-ui-kit';
import { ConfigurationFilesTableConfig } from '../../configs/configuration-files-table.config';
import { ConfigurationDetailsFacadeService } from '../../services/configuration-details-facade.service';

@Component({
  selector: 'core-configuration-file-table',
  templateUrl: './configuration-file-table.html',
  styleUrl: './configuration-file-table.scss',
  imports: [Table],
})
export class ConfigurationFileTable {
  private readonly configurationDetailsFacadeService = inject(ConfigurationDetailsFacadeService);
  private readonly tableConfigService = inject(ConfigurationFilesTableConfig);

  tableConfig = this.tableConfigService.getConfig();
  tableData = this.configurationDetailsFacadeService.configurationFiles;

  constructor() {
    effect(() => {
      const data = this.tableData();

      console.log('data', data);
    });
  }
}
