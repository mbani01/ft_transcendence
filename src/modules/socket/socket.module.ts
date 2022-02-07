/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   socket.module.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/04 09:51:07 by mbani             #+#    #+#             */
/*   Updated: 2022/02/07 13:02:17 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { gameSocket } from './gameSocket.gateway';
import { socketGateway } from './socket.gateway';

@Module({
	providers: [socketGateway, gameSocket]
})
export class SocketModule {
	
}
