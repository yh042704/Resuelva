import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'api',
  apiReport: 'report',
  production: false
};
