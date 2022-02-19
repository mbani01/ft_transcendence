// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'localhost',
  apiPort: 4200,
  socketPort: 3000,
  // get apiBaseUrl() { return `http://${this.host}:${this.apiPort}/api/v1`},
  get apiBaseUrl() { return '/api/v1'},
  get socketUri() {return `ws://${this.host}:${this.socketPort}`},
  get chatSocketUri() {return `ws://${this.host}:${this.socketPort}/chat`},
  get gameSocketUri() {return `ws://${this.host}:${this.socketPort}/game`}
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
