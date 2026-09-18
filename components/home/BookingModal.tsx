'use client';

export interface BookingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currency?: any;
  initialPackageId?: string;
  initialDestination?: string;
  initialCouponCode?: string;
  initialAddonId?: string;
  initialVehicleId?: string;
  [key: string]: any;
}

/**
 * @deprecated The mock BookingModal has been permanently removed. All booking interactions navigate directly to /booking.
 */
export default function BookingModal(_props: BookingModalProps) {
  return null;
}
