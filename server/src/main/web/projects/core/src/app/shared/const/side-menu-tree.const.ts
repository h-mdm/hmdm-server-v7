import { TSideMenuNode } from '../types/side-menu-node.type';

export const SIDE_MENU_TREE: TSideMenuNode[] = [
  {
    name: 'tab.dashboard',
    route: '/home/dashboard',
    icon: 'dashboard',
    opts: { exact: true },
  },
  {
    name: 'tab.devices',
    route: '/home/devices',
    icon: 'devices',
  },
  {
    name: 'tab.applications',
    route: 'applications',
    icon: 'apps',
    permission: 'applications',
  },
  {
    name: 'tab.configurations',
    route: 'configurations',
    icon: 'settings',
    permission: 'configurations',
  },
  {
    name: 'tab.files',
    route: 'files',
    icon: 'folder',
    permission: 'files',
  },
  {
    name: 'tab.alerts',
    route: 'alerts',
    icon: 'warning'
  },
  {
    name: 'menu.settings',
    permission: 'settings',
    children: [
      {
        name: 'tab.common.settings',
        route: 'settings/devices',
        icon: 'table_chart',
      },
      {
        name: 'tab.users',
        route: 'settings/users',
        icon: 'people',
      },
      {
        name: 'tab.roles',
        route: 'settings/roles',
        icon: 'security',
      },
      {
        name: 'tab.groups',
        route: 'settings/groups',
        icon: 'group_work',
      },
      {
        name: 'tab.icons',
        route: 'settings/icons',
        icon: 'insert_photo',
      },
      {
        name: 'tab.language',
        route: 'settings/general',
        icon: 'settings',
      },
      ...(window as any)['__DYNPLUGINS__']
        ?.filter((plugin: any) => plugin.hasSettingsPage)
        .map((plugin: any) => ({
          name: plugin.nameLocalizationKey,
          pluginName: plugin.identifier,
          route: plugin.path + '/settings',
          icon: plugin.icon || 'extension',
          permission: plugin.settingsPermission || null,
        })),
    ],
  },
  (window as any)['__DYNPLUGINS__'] && {
    name: 'menu.functions',
    icon: 'functions',
    children: [
      ...(window as any)['__DYNPLUGINS__']?.map((plugin: any) => ({
        name: plugin.nameLocalizationKey,
        pluginName: plugin.identifier,
        route: plugin.path,
        icon: plugin.icon || 'extension',
        permission: plugin.functionsPermission || null,
        opts: { exact: true },
      })),
    ],
  },
];
