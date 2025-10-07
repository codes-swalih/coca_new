import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import userPersonal from "../../../../../app/models/admin/UserPersonal";
import userAuthObj from "../../../../../configs/appwrite_auth_config";

interface getOtpRequest {
  phone: string;
}

export const POST = async (req: Request) => {
  const body: getOtpRequest = await req.json();
  const { phone } = body;

  try {
    await connectToMongoDB();
    if (!phone) {
      return NextResponse.json(
        { status: "Failed", message: "Please provide the phone number" },
        { status: 404 }
      );
    }

    const isMember = await userPersonal.findOne({ phone: phone });
    if (!isMember) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "The user with this phone number is not a COCA Member",
        },
        { status: 404 }
      );
    }

    const loginResponse = await userAuthObj.sendSms(phone);

    if (!loginResponse) {
      return NextResponse.json(
        { status: "Failed", message: "cannot found otp number" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      [
        {
          status: "Success",
          message:
            "You have succesfully sended otp and all the details of the member!",
        },
        {
          otp: loginResponse,
          // For special number, also return the userId for verification
          ...(phone === "9061685930" && { userId: loginResponse.userId }),
        },
      ],
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in sending otp number", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
};
