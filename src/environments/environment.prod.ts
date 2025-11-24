import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'https://192.168.1.4:44355/api/',
  production: false
};
