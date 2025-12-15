import Registration from '../models/Registration';

export async function isCouponAvailable(couponNo: string): Promise<{
  available: boolean;
  existingRegistration?: any;
}> {
  const existing = await Registration.findOne({
    couponNo,
    deletedAt: null
  }).lean();

  if (existing) {
    return {
      available: false,
      existingRegistration: {
        name: existing.name,
        mobileNo: existing.mobileNo,
        couponNo: existing.couponNo
      }
    };
  }

  return { available: true };
}

export function validateCouponFormat(couponNo: string): boolean {
  // Allow alphanumeric characters
  return /^[a-zA-Z0-9]+$/.test(couponNo) && couponNo.length > 0;
}

export function validateMobileFormat(mobileNo: string): boolean {
  // Exactly 10 digits
  return /^[0-9]{10}$/.test(mobileNo);
}
