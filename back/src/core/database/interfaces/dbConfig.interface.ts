/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   dbConfig.interface.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/01 10:06:07 by mbani             #+#    #+#             */
/*   Updated: 2022/02/01 10:06:08 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface IDatabaseConfigAttributes {
    username?: string;
    password?: string;
    database?: string;
    host?: string;
    port?: number | string;
    dialect?: string;
    urlDatabase?: string;
}

export interface IDatabaseConfig {
    development: IDatabaseConfigAttributes;
    test: IDatabaseConfigAttributes;
    production: IDatabaseConfigAttributes;
}