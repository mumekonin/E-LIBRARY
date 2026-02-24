import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class SettingsSchema {
  @Prop({ default: 'E-Library' })
  siteName: string;
   @Prop({ unique: true, default: 'system_config' }) // Add this line
  slug: string;
  @Prop({ default: '/uploads/system/logo.png' })
  logoUrl: string;

  @Prop({ default: '/uploads/videos/welcome-bg.mp4' })
  welcomeVideoUrl: string;
}
export const settingsSchema = SchemaFactory.createForClass(SettingsSchema);