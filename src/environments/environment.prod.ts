import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'https://192.168.1.4:44355/api/',
  apiReport: 'https://pruebas.trazaragro3.oirsa.org/report',
  // apiUrl: 'api',
  // apiReport: 'report',
  production: false
};
