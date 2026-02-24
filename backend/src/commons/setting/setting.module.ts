import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { settingsSchema, SettingsSchema } from './schema/setting.schema';
import { SettingsController } from './controller/setting.controller';
import { SettingService } from './service/setting.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SettingsSchema.name, schema:settingsSchema}])
  ],
  controllers: [SettingsController],
  providers: [SettingService],
})
export class SettingsModule {}