import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: "Cloudinary",
  useFactory: (): any => {
    return v2.config({ 
		cloud_name: 'transcendence', 
		api_key: '167555412448937', 
		api_secret: '0DgDpmGymBvQe4Ues248kZD-b_8' 
	  });
  },
};