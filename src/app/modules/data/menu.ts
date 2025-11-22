import { Navigation } from 'src/app/@theme/types/navigation';

export const menus: Navigation[] = [
  {
    id: 'Reparaciones',
    title: 'Reparaciones',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'HojaIngreso',
        title: 'Hoja de Ingreso',
        type: 'item',
        classes: 'nav-item',
        link: () => import('../pages/application/pantalla1/pantalla1'),
        icon: 'pi pi-address-book'
      },
      {
        id: 'OrdenTrabajo',
        title: 'Orden de Trabajo',
        type: 'item',
        classes: 'nav-item',
        link: () => import('../pages/application/pantalla2/pantalla2'),
        icon: 'pi pi-calendar-clock',
      },
      {
        id: 'Aprobaciones',
        title: 'Aprobaciones',
        type: 'item',
        classes: 'nav-item',
        link: () => import('../pages/application/pantalla2/pantalla2'),
        icon: 'pi pi-check-circle',
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
        icon: 'pi pi-list-check'
      },
      {
        id: 'compras',
        title: 'Compras',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-cart-plus'
      },
      {
        id: 'Ventas',
        title: 'Ventas',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-chart-line'
      },
      {
        id: 'MovInventario',
        title: 'Movimientos de Inventario',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-truck'
      }
    ]
  },
  {
    id: 'Catalogos',
    title: 'Catálogos',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Clientes',
        title: 'Clientes',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-user'
      },
      {
        id: 'Proveedores',
        title: 'Proveedores',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-id-card'
      },
      {
        id: 'Productos',
        title: 'Productos',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-qrcode'
      },
      {
        id: 'CatGenerales',
        title: 'Catálogos Generales',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-th-large'
      }
    ]
  },
  {
    id: 'Seguridad',
    title: 'Seguridad',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Usuarios',
        title: 'Usuarios',
        type: 'item',
        classes: 'nav-item',
        icon: 'pi pi-users'
      }
    ]
  }
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
