import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  couponNo: string;
  name: string;
  mobileNo: string;
  createdAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

const RegistrationSchema: Schema = new Schema({
  couponNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null,
    index: true
  },
  deletedBy: {
    type: String,
    default: null
  }
});

// Compound indexes for efficient queries
RegistrationSchema.index({ deletedAt: 1, name: 1 });
RegistrationSchema.index({ deletedAt: 1, couponNo: 1 });
RegistrationSchema.index({ deletedAt: 1, createdAt: -1 });

// Text index for name search
RegistrationSchema.index({ name: 'text' });

export default mongoose.model<IRegistration>('Registration', RegistrationSchema);
