import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import userservice from "../../../models/admin/UserSerivce";
import userBusines from "../../../models/admin/UserBusiness";
import userPersonal from "../../../models/admin/UserPersonal";
import UsersTestimonial from "../../../models/admin/UserTestimonial";

import { connectToMongoDB } from "../../../../../libs/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();

    const searchParams = req.nextUrl.searchParams;
    const serviceIdString = searchParams.get("service");
    const businessLocation = searchParams.get("businessLocation");

    if (!serviceIdString && !businessLocation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please choose at least one filter option (service or businessLocation)",
        },
        { status: 400 }
      );
    }

    let memberIds: string[] = [];

    if (serviceIdString && businessLocation) {
      const serviceMembers = await userservice
        .find({
          serviceId: serviceIdString,
        })
        .lean();

      const serviceMemberIds = serviceMembers.map((member) => member.memberId);

      const businessMembers = await userBusines
        .find({
          memberId: { $in: serviceMemberIds },
          businessLocation: businessLocation,
        })
        .lean();

      memberIds = businessMembers.map((member) => member.memberId);
    } else if (serviceIdString) {
      const serviceMembers = await userservice
        .find({
          serviceId: serviceIdString,
        })
        .lean();

      memberIds = serviceMembers.map((member) => member.memberId);
    } else if (businessLocation) {
      const businessMembers = await userBusines
        .find({
          businessLocation: businessLocation,
        })
        .lean();

      memberIds = businessMembers.map((member) => member.memberId);
    }

    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const [businesses, personal, services, testimonials] = await Promise.all([
      userBusines.find({ memberId: { $in: memberIds } }).lean(),
      userPersonal.find({ memberId: { $in: memberIds } }).lean(),
      userservice
        .find({ memberId: { $in: memberIds } })
        .populate("serviceId")
        .lean(),
      UsersTestimonial.find({ memberId: { $in: memberIds } }).lean(),
    ]);

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
