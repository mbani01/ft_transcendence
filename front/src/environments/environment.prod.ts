export const environment = {
  production: true,
  host: '10.12.10.9',
  apiPort: 3000,
  socketPort: 3000,
  get apiBaseUrl() { return `/api/v1`},
  get socketUri() {return ``},
};
