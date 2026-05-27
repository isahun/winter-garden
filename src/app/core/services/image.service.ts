import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImageService {
  async uploadToCloudinary(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', environment.cloudinaryUploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: form },
    );
    const json = await res.json() as { secure_url: string };
    return json.secure_url.replace(
      '/upload/',
      '/upload/w_800,h_800,c_pad,b_white,f_auto,q_auto/',
    );
  }
}
