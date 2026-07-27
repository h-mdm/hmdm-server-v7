import { Injectable } from '@angular/core';
import { TTableConfig } from 'hmdm-ui-kit';
import { AppsActionCell } from '../components/apps-action-cell/apps-action-cell';
import { AppsNameCell } from '../components/apps-name-cell/apps-name-cell';
import { AppsIconCell } from '../components/apps-icon-cell/apps-icon-cell';
import { AppsMoreCell } from '../components/apps-more-cell/apps-more-cell';
import { AppsOrderCell } from '../components/apps-order-cell/apps-order-cell';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationAppsTableConfig {
  getConfig(): TTableConfig {
    return {
      trackBy(index, item) {
        return index;
      },
      columns: [
        {
          field: 'name',
          title: 'table.heading.application.name',
          sortable: true,
          cellRenderer: AppsNameCell,
        },
        {
          field: 'version',
          title: 'table.heading.application.version',
        },
        {
          field: 'action',
          title: 'table.heading.application.actions',
          cellRenderer: AppsActionCell,
        },
        {
          field: 'icon',
          title: 'table.heading.application.label',
          cellRenderer: AppsIconCell,
        },
        {
          field: 'order',
          title: 'table.heading.application.order',
          cellRenderer: AppsOrderCell,
        },
        {
          field: 'more',
          title: '',
          cellRenderer: AppsMoreCell,
        },
      ],
    };
  }
}
