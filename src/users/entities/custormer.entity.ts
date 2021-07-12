import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Skill, SkillSchema } from './skill.entity';
@Schema()
export class Customer extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone: string;

  @Prop({
    type: [SkillSchema],
  })
  skills: Types.Array<Skill>;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
