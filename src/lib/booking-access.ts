const WHOLE_BOOKING_BUDGET_FIELDS = [
  "totalBudget",
  "advanceAmount",
  "eventDayPayment",
  "balanceAmount",
  "expenses",
] as const;

export interface BookingResponseSource {
  memberId: string;
  associatedProgram?: Array<{
    members?: Array<{ memberId?: string }>;
  }>;
  [key: string]: unknown;
}

export function prepareBookingForMember(
  booking: BookingResponseSource,
  requesterMemberId: string | null,
  ownerName: string | null
) {
  const responseBooking = { ...booking };
  const isAssociatedBooking = Boolean(
    requesterMemberId && requesterMemberId !== responseBooking.memberId
  );

  if (isAssociatedBooking) {
    for (const field of WHOLE_BOOKING_BUDGET_FIELDS) {
      delete responseBooking[field];
    }
  }

  return {
    ...responseBooking,
    ownerName,
    isAssociatedBooking,
    canEdit: !isAssociatedBooking,
  };
}
