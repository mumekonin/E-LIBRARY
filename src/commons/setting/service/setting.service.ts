import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SettingsSchema } from '../schema/setting.schema';
 // Ensure this path is correct

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(SettingsSchema.name)
    private readonly settingsModel: Model<SettingsSchema>, // Renamed for clarity
  ) {}

  // Get the settings, or create them if they don't exist
  async getSettings() {
    let settings = await this.settingsModel.findOne({ slug: 'system_config' }).exec();
    if (!settings) {
      settings = await this.settingsModel.create({ slug: 'system_config' });
    }
    return settings;
  }

  // Update specific fields (like welcomeVideoUrl or logoUrl)
  async updateSettings(data: Partial<SettingsSchema>) {
    return this.settingsModel.findOneAndUpdate(
      { slug: 'system_config' },
      { $set: data },
      { upsert: true, new: true },
    );
  }

  // Specific method for the welcome video path
  async updateWelcomeVideoPath(path: string) {
    return this.settingsModel.findOneAndUpdate(
      { slug: 'system_config' }, // Stay consistent with the slug
      { $set: { welcomeVideoUrl: path } },
      { upsert: true, new: true },
    );
  }
}