export const environment = {
  production: true,
  apiPort: 3000,
  socketPort: 3000,
  get apiBaseUrl() { return `/api/v1`},
  get socketUri() {return ``},
};
