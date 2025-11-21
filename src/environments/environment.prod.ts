import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'https://localhost:44344/api/',
  production: false
};
