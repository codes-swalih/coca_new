import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import userPersonal from "../../../../../app/models/admin/UserPersonal";
import userBusines from "../../../../../app/models/admin/UserBusiness";
import userService from "../../../../../app/models/admin/UserSerivce";
import UsersTestimonial from "../../../../../app/models/admin/UserTestimonial";
import userAuthObj from "../../../../../configs/appwrite_auth_config";
import services from "../../../../../app/models/admin/services";

interface verifyOtpRequest {
  userId: string;
  secret: string;
  phone: string;
  fcmToken: string;
}

export const POST = async (req: Request) => {
  const body: verifyOtpRequest = await req.json();
  const { userId, secret, phone, fcmToken } = body;
  try {
    await connectToMongoDB();
    const memberPersonal = await userPersonal.findOne({ phone: phone });
    if (!memberPersonal) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Failed to verify the otp. some thing went wrong",
        },
        { status: 404 }
      );
    }

    await userPersonal.findOneAndUpdate(
      { phone: phone },
      { fcmToken },
      { new: true }
    );

    const memberBusiness = await userBusines.findOne({
      memberId: memberPersonal.memberId,
    });

    const memberService = await userService
      .findOne({
        memberId: memberPersonal.memberId,
      })
      .populate("serviceId");

    const memberTestimonial = await UsersTestimonial.findOne({
      memberId: memberPersonal.memberId,
    });

    let verifiedResponse;

    // Handle special case for phone number 9995833989
    if (phone === "9061685930" && secret === "000000") {
      // For the special number, create a mock session response
      verifiedResponse = {
        session: {
          $id: "special-session-id",
          userId: userId,
        },
      };
    } else {
      // For normal OTP verification
      verifiedResponse = await userAuthObj.userLogin(userId, secret);
    }

    if (!verifiedResponse) {
      return NextResponse.json(
        { status: "Failed", message: "Can't verify the otp number" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      [
        {
          status: "Success",
          message: "You have succesfully verified your otp number",
          data: verifiedResponse,
        },
        { member_personal_details: memberPersonal },
        {
          member_business_details: memberBusiness
            ? memberBusiness
            : "This member business details is not uploaded",
        },
        {
          member_service_details: memberService
            ? memberService
            : "this member services is not uploaded",
        },
        {
          member_testimonials: memberTestimonial
            ? memberTestimonial
            : "this member testimonial is not uploaded",
        },
      ],
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in verifying the otp number", error);
    return NextResponse.json(
      { message: "internal server error", error: error.message },
      { status: 500 }
    );
  }
};
