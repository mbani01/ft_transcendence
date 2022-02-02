export class AppConfig {
  public static readonly CLIENT_ID = '802dd62932bab69d1e0168a42ed0567a6b83267c134fb2f62d583c14b2a4ce97';
  public static readonly CLIENT_SECRET = '90e1a8765ecb7d464e48b23b94843495e261dfa71d7facd9933ab0e1dc0d4096';
  public static readonly OAUTH_REDIRECT_URI = 'http://localhost:4200/login/callback';
  public static readonly OAUTH_URL = `https://api.intra.42.fr/oauth/authorize?client_id=${AppConfig.CLIENT_ID}&redirect_uri=${AppConfig.OAUTH_REDIRECT_URI}&response_type=code`;
  public static readonly OAUTH_TOKEN_URL = 'https://api.intra.42.fr/oauth/token';
}
