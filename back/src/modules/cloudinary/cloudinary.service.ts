/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   cloudinary.service.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mbani <mbani@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/02/26 19:01:43 by mbani             #+#    #+#             */
/*   Updated: 2022/02/26 20:30:17 by mbani            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
@Injectable()

export class CloudinaryService {
  async uploadImage(imgBase64: string)
  {
	  const upload = await v2.uploader.upload(imgBase64);
	  console.log(upload);
	  return upload;
  }
  
}
