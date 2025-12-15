import userBusines from "@/app/models/admin/UserBusiness";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";

interface userBusinessRequest {
  nameOfBusiness: string;
  businessPhoneNumber: string;
  businessEmailId: string;
  address: string;
  businessLocation: string;
  businessLogo: string;
  gallaryLink: string;
  facebookAccount: string;
  instagramAccount: string;
  whatsAppLink: string;
  youtubeChannel: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  paymentQrCode: string;
  lat: string;
  log: string;
  memberId: string;
  mid: string;
}

export const POST = async (req: Request) => {
  const body: userBusinessRequest = await req.json();

  const {
    nameOfBusiness,
    businessPhoneNumber,
    businessEmailId,
    address,
    businessLocation,
    businessLogo,
    gallaryLink,
    facebookAccount,
    instagramAccount,
    whatsAppLink,
    youtubeChannel,
    bankName,
    accountNumber,
    ifsc,
    branch,
    upiId,
    paymentQrCode,
    lat,
    log,
    memberId,
    mid,
  } = body;

  try {
    await connectToMongoDB();
    const isAlreadyUploaded = await userBusines.findOne({ memberId: memberId });
    if (isAlreadyUploaded) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "This is user's business details is already uploaded",
        },
        { status: 409 }
      );
    }

    const uploadedBusinessDetails = await userBusines.create({
      nameOfBusiness,
      businessPhoneNumber,
      businessEmailId,
      address,
      businessLocation,
      businessLogo,
      gallaryLink,
      facebookAccount,
      instagramAccount,
      whatsAppLink,
      youtubeChannel,
      bankName,
      accountNumber,
      ifsc,
      branch,
      upiId,
      paymentQrCode,
      location: {
        type: "Point",
        coordinates: [parseFloat(log), parseFloat(lat)],
      },
      memberId,
      mid,
    });

    if (!uploadedBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Something wrong with uploading this user's business details",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully uploaded this user business details!",
        data: uploadedBusinessDetails,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log("Error in uploading this user business details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
