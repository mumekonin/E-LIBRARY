import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SettingService } from '../service/setting.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingService) {}

  // 1. Get all settings (for frontend to find logo and welcome video)
  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  // 2. Set Welcome Video Path (Manual - No Upload)
  @Post('set-video-path')
  async setVideoPath(@Body('path') path: string) {
    if (!path) {
      throw new BadRequestException('Path string is required');
    }
    // Updates DB so frontend knows where to look for the video
    return this.settingsService.updateWelcomeVideoPath(path);
  }

  // 3. Upload Logo (Automatic - Handles file and DB)
  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './uploads/system',
      filename: (req, file, cb) => {
        // Use a timestamp to avoid browser caching issues
        const filename = `logo-${Date.now()}${extname(file.originalname)}`;
        cb(null, filename); 
      },
    }),
  }))
  async setLogo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const logoPath = `/uploads/system/${file.filename}`;
    
    // IMPORTANT: You MUST update the database here
    await this.settingsService.updateSettings({ logoUrl: logoPath });

    return { 
      message: "Logo updated successfully",
      path: logoPath 
    };
  }
}