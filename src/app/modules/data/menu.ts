import { Navigation } from 'src/app/@theme/types/navigation';

export const menus: Navigation[] = [
  // {
  //   id: 'navigation',
  //   title: 'Navigation',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'Dashboard',
  //       title: 'Dashboard',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/dashboard',
  //       icon: '#custom-status-up'
  //     }
  //   ]
  // },
  {
    id: 'Reparaciones',
    title: 'Reparaciones',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'pantalla1',
        title: 'Pantalla 1',
        type: 'item',
        classes: 'nav-item',
        link: () => import('../pages/application/pantalla1/pantalla1'),
        icon: '#custom-shield'
      },
      {
        id: 'pantalla2',
        title: 'Pantalla 2',
        type: 'item',
        classes: 'nav-item',
        link: () => import('../pages/application/pantalla2/pantalla2'),
        icon: '#custom-password-check',
      }
    ]
  },
  {
    id: 'Inventarios',
    title: 'Inventarios',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'cotizaciones',
        title: 'Cotizaciones',
        type: 'item',
        classes: 'nav-item',
        icon: '#custom-text-block'
      },
      {
        id: 'compras',
        title: 'Compras',
        type: 'item',
        classes: 'nav-item',
        icon: '#custom-text-block'
      },
      {
        id: 'Ventas',
        title: 'Ventas',
        type: 'item',
        classes: 'nav-item',
        icon: '#custom-clipboard'
      }
    ]
  },
  // {
  //   id: 'other',
  //   title: 'Other',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   children: [
  //     {
  //       id: 'menu-levels',
  //       title: 'Menu levels',
  //       type: 'collapse',
  //       icon: '#custom-level',
  //       children: [
  //         {
  //           id: 'level-2-1',
  //           title: 'Level 2.1',
  //           type: 'item',
  //           url: 'javascript:'
  //         },
  //         {
  //           id: 'menu-level-2.2',
  //           title: 'Menu Level 2.2',
  //           type: 'collapse',
  //           classes: 'edge',
  //           children: [
  //             {
  //               id: 'menu-level-3.1',
  //               title: 'Menu Level 3.1',
  //               type: 'item',
  //               url: 'javascript:'
  //             },
  //             {
  //               id: 'menu-level-3.2',
  //               title: 'Menu Level 3.2',
  //               type: 'item',
  //               url: 'javascript:'
  //             },
  //             {
  //               id: 'menu-level-3.3',
  //               title: 'Menu Level 3.3',
  //               type: 'collapse',
  //               classes: 'edge',
  //               children: [
  //                 {
  //                   id: 'menu-level-4.1',
  //                   title: 'Menu Level 4.1',
  //                   type: 'item',
  //                   url: 'javascript:'
  //                 },
  //                 {
  //                   id: 'menu-level-4.2',
  //                   title: 'Menu Level 4.2',
  //                   type: 'item',
  //                   url: 'javascript:'
  //                 }
  //               ]
  //             }
  //           ]
  //         },
  //         {
  //           id: 'menu-level-2.3',
  //           title: 'Menu Level 2.3',
  //           type: 'collapse',
  //           classes: 'edge',
  //           children: [
  //             {
  //               id: 'menu-level-3.1',
  //               title: 'Menu Level 3.1',
  //               type: 'item',
  //               url: 'javascript:'
  //             },
  //             {
  //               id: 'menu-level-3.2',
  //               title: 'Menu Level 3.2',
  //               type: 'item',
  //               url: 'javascript:'
  //             },
  //             {
  //               id: 'menu-level-3.3',
  //               title: 'Menu Level 3.3',
  //               type: 'collapse',
  //               classes: 'edge',
  //               children: [
  //                 {
  //                   id: 'menu-level-4.1',
  //                   title: 'Menu Level 4.1',
  //                   type: 'item',
  //                   url: 'javascript:'
  //                 },
  //                 {
  //                   id: 'menu-level-4.2',
  //                   title: 'Menu Level 4.2',
  //                   type: 'item',
  //                   url: 'javascript:'
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: 'sample-page',
  //       title: 'Sample Page',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: '/sample-page',
  //       icon: '#custom-notification-status'
  //     }
  //   ]
  // }
];
