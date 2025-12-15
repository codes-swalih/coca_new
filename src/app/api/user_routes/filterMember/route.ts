import { NextRequest, NextResponse } from "next/server";
import userservice from "../../../models/admin/UserSerivce";
import userBusines from "../../../models/admin/UserBusiness";
import userPersonal from "../../../models/admin/UserPersonal";
import UsersTestimonial from "../../../models/admin/UserTestimonial";
import bookings from "../../../models/bookings/bookingsModel";
import { connectToMongoDB } from "../../../../../libs/mongodb";

/**
 * This route filters members by:
 * - serviceId (optional)
 * - businessLocation (optional)
 * - geographic location (optional via lat, lng, radius)
 */
export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const serviceIdString = searchParams.get("service");
    const businessLocation = searchParams.get("businessLocation");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = parseFloat(searchParams.get("radius") || "5000");
    const date = searchParams.get("date");
    const dayOrNightParam = searchParams.get("dayOrNight");

    if (!serviceIdString && !businessLocation && !(lat && lng)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide at least one filter: service, businessLocation, or lat/lng",
        },
        { status: 400 }
      );
    }

    let memberIds: string[] = [];

    // Step 1: Filter by Service ID (if provided)
    if (serviceIdString) {
      const serviceMembers = await userservice
        .find({ serviceId: serviceIdString })
        .lean();

      memberIds = serviceMembers.map((m) => m.memberId);
    }

    // Step 2: Filter by business location or proximity
    let businessQuery: any = {};

    if (businessLocation) {
      businessQuery.businessLocation = businessLocation;
    }

    // 🧭 Step 3: Add geo filter if lat/lng provided
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid latitude or longitude",
          },
          { status: 400 }
        );
      }

      businessQuery.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: radius, // in meters
        },
      };
    }

    // Step 4: Run business query
    if (Object.keys(businessQuery).length > 0) {
      if (memberIds.length > 0) {
        businessQuery.memberId = { $in: memberIds };
      }

      const businessMembers = await userBusines.find(businessQuery).lean();
      memberIds = businessMembers.map((m) => m.memberId);
    }

    // Step 5: Exclude members with bookings on the specified date
    if (date) {
      let bookingQuery: any = { startingDate: date };
      if (dayOrNightParam !== null) {
        const dayOrNight = dayOrNightParam === "true";
        bookingQuery.dayOrNight = dayOrNight;
      }

      const bookedBookings = await bookings.find(bookingQuery).lean();
      const bookedMemberIds = new Set<string>();

      bookedBookings.forEach((booking) => {
        bookedMemberIds.add(booking.memberId);
        booking.associatedProgram.forEach((prog) => {
          prog.members.forEach((mem) => {
            bookedMemberIds.add(mem.memberId);
          });
        });
      });

      memberIds = memberIds.filter((id) => !bookedMemberIds.has(id));
    }

    // Handle empty results
    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Step 5: Fetch all related data (parallel queries)
    const [businesses, personal, services, testimonials] = await Promise.all([
      userBusines.find({ memberId: { $in: memberIds } }).lean(),
      userPersonal.find({ memberId: { $in: memberIds } }).lean(),
      userservice
        .find({ memberId: { $in: memberIds } })
        .populate("serviceId")
        .lean(),
      UsersTestimonial.find({ memberId: { $in: memberIds } }).lean(),
    ]);

    // Step 6: Merge results by memberId
    const memberDetailsMap = new Map();

    memberIds.forEach((memberId) => {
      memberDetailsMap.set(memberId, {
        member_business_detail:
          businesses.find((b) => b.memberId === memberId) || null,
        member_personal_detail:
          personal.find((p) => p.memberId === memberId) || null,
        member_service_detail:
          services.find((s) => s.memberId === memberId) || null,
        member_testimonial_details:
          testimonials.filter((t) => t.memberId === memberId) || [],
      });
    });

    const finalResults = Array.from(memberDetailsMap.entries()).map(
      ([memberId, details]) => ({
        memberId,
        ...details,
      })
    );

    return NextResponse.json({
      success: true,
      count: finalResults.length,
      data: finalResults,
    });
  } catch (error) {
    console.error("Filter members error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error filtering members",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
