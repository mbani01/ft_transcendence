/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   database.providers.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/01 14:25:31 by mbani             #+#    #+#             */
/*   Updated: 2022/02/02 16:14:17 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { TYPEORM, DEVELOPMENT, TEST, PRODUCTION } from '../constants';
import { databaseConfig } from './database.config';
import { createConnection } from 'typeorm';

export const databaseProviders = [{
   provide: TYPEORM,
    useFactory: async () => {
        let config;
        switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
           config = databaseConfig.development;
           break;
        case TEST:
           config = databaseConfig.test;
           break;
        case PRODUCTION:
           config = databaseConfig.production;
           break;
        default:
           config = databaseConfig.development;
        }
      await createConnection(config);
      }
}];