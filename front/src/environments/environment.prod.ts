export const environment = {
  production: true,
  host: 'localhost',
  httpPort: 3000,
  apiPort: 3000,
  socketPort: 3000,
  get apiBaseUrl() { return `http://${this.host}:${this.apiPort}/api/v1`},
  get socketUri() {return `ws://${this.host}:${this.socketPort}`},
  get chatSocketUri() {return `ws://${this.host}:${this.socketPort}/chat`},
  get gameSocketUri() {return `ws://${this.host}:${this.socketPort}/game`}
};
