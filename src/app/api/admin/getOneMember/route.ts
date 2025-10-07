import userPersonal from "../../../models/admin/UserPersonal";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import userBusines from "../../../models/admin/UserBusiness";
import userservice from "../../../models/admin/UserSerivce";
import UsersTestimonial from "../../../../app/models/admin/UserTestimonial";
import "../../../models/admin/services"
import { NextResponse } from "next/server";

interface memberDetails {
  memberId: string;
}

export const POST = async (req: Request) => {
  const body: memberDetails = await req.json();
  const { memberId } = body;
  try {
    await connectToMongoDB();

    const memberPersonal = await userPersonal.findOne({ memberId: memberId });
    const memberBusiness = await userBusines.findOne({ memberId: memberId });
    const memberService = await userservice.findOne({ memberId: memberId }).populate("serviceId") as any;
    const memberTestimonial = await UsersTestimonial.findOne({
      memberId: memberId,
    });

    if (
      !memberPersonal &&
      !memberBusiness &&
      !memberService &&
      !memberTestimonial
    ) {
      return NextResponse.json(
        { status: "Failed", message: "There is no data with this memberId" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully fetched a member details",
        data: {
          user_personal: memberPersonal,
          user_busines: memberBusiness,
          user_service: memberService,
          user_testimonial: memberTestimonial,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching this user details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
