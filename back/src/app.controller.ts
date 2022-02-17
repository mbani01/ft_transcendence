import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/oauth_page')
  getOauthPage() {
    return {
      page: 'https://api.intra.42.fr/oauth/authorize?client_id=802dd62932bab69d1e0168a42ed0567a6b83267c134fb2f62d583c14b2a4ce97&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&response_type=code',
    };
  }
}
