/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   database.module.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/01 10:06:20 by mbani             #+#    #+#             */
/*   Updated: 2022/02/01 14:32:31 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';

@Module({
	providers: databaseProviders,
	exports: databaseProviders,
})
export class DatabaseModule {}
