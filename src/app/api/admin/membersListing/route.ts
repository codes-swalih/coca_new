import userPersonal from "../../../models/admin/UserPersonal";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import userBusines from "../../../models/admin/UserBusiness";
import userservice from "../../../models/admin/UserSerivce";
import UsersTestimonial from "../../../models/admin/UserTestimonial";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const memberPersonal = await userPersonal
      .find()
      .sort({ nameOfBusinessOwner: 1 })
      .skip(skip)
      .limit(limit);

    if (memberPersonal.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No user found" },
        { status: 404 }
      );
    }

    const member = await Promise.all(
      memberPersonal.map(async (items, index) => {
        const memberBusiness = await userBusines
          .findOne({
            memberId: items.memberId,
          })
          .lean();

        const memberService = await userservice
          .findOne({
            memberId: items.memberId,
          })
          .lean();

        const memberTestimonial = await UsersTestimonial.findOne({
          memberId: items.memberId,
        }).lean();

        return {
          No: index + 1,
          member_personal_detail: items.toObject(),
          member_business_detail: memberBusiness ? memberBusiness : null,
          member_service_detail: memberService ? memberService : null,
          member_testimonial_details: memberTestimonial
            ? memberTestimonial
            : null,
        };
      })
    );

    if (member.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "There is member uploaded" },
        { status: 404 }
      );
    }

    const totalRecords = await userPersonal.countDocuments();
    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      status: "Success",
      message: "You have succesfully fetched all members details",
      data: member,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
      },
    });
  } catch (error: any) {
    console.log("Error in fetching members details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 505 }
    );
  }
};
