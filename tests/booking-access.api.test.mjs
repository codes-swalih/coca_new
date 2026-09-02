import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.COCA_API_BASE_URL || "http://localhost:3100";

let fixturePromise;

const getAssociatedBookingFixture = async () => {
  if (fixturePromise) return fixturePromise;

  fixturePromise = (async () => {
    const allResponse = await fetch(`${baseUrl}/api/user_routes/bookings`);
    const allPayload = await allResponse.json();
    const booking = allPayload.data.find(
      (item) =>
        typeof item.ownerName === "string" &&
        item.ownerName.length > 0 &&
        item.associatedProgram?.some((program) =>
          program.members?.some(
          (member) => member.memberId && member.memberId !== item.memberId
          )
        )
    );

    assert.ok(booking, "expected an associated booking with an existing owner");

    const ownerResponse = await fetch(
      `${baseUrl}/api/user_routes/membersListing/getOneMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: booking.memberId }),
      }
    );
    const ownerPayload = await ownerResponse.json();

    return {
      booking,
      ownerName: ownerPayload.data.user_personal.nameOfBusinessOwner,
    };
  })();

  return fixturePromise;
};

test("associated booking hides whole-budget fields and identifies the owner", async () => {
  const { booking: sample, ownerName } = await getAssociatedBookingFixture();

  const associatedMemberId = sample.associatedProgram
    .flatMap((program) => program.members || [])
    .find((member) => member.memberId && member.memberId !== sample.memberId)
    .memberId;

  const response = await fetch(
    `${baseUrl}/api/user_routes/bookings?memberId=${associatedMemberId}`
  );
  const payload = await response.json();
  const booking = payload.data.find((item) => item._id === sample._id);

  assert.equal(booking.isAssociatedBooking, true);
  assert.equal(booking.canEdit, false);
  assert.equal(booking.ownerName, ownerName);

  for (const field of [
    "totalBudget",
    "advanceAmount",
    "eventDayPayment",
    "balanceAmount",
    "expenses",
  ]) {
    assert.equal(Object.hasOwn(booking, field), false, `${field} must be hidden`);
  }
});

test("booking owner keeps edit access and whole-budget fields", async () => {
  const { booking: sample, ownerName } = await getAssociatedBookingFixture();

  const response = await fetch(
    `${baseUrl}/api/user_routes/bookings?memberId=${sample.memberId}`
  );
  const payload = await response.json();
  const booking = payload.data.find((item) => item._id === sample._id);

  assert.equal(booking.isAssociatedBooking, false);
  assert.equal(booking.canEdit, true);
  assert.equal(booking.ownerName, ownerName);
  assert.equal(Object.hasOwn(booking, "totalBudget"), true);
});

test("associated booking detail applies the same privacy contract", async () => {
  const { booking: sample, ownerName } = await getAssociatedBookingFixture();
  const associatedMemberId = sample.associatedProgram
    .flatMap((program) => program.members || [])
    .find((member) => member.memberId && member.memberId !== sample.memberId)
    .memberId;

  const response = await fetch(
    `${baseUrl}/api/user_routes/bookings/${sample._id}?memberId=${associatedMemberId}`
  );
  const payload = await response.json();

  assert.equal(payload.data.isAssociatedBooking, true);
  assert.equal(payload.data.canEdit, false);
  assert.equal(payload.data.ownerName, ownerName);
  assert.equal(Object.hasOwn(payload.data, "totalBudget"), false);
});
