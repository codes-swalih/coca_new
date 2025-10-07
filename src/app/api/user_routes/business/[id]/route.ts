import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import userBusines from "../../../../../app/models/admin/UserBusiness";

interface businessUpdatingRequest {
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
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  const body: businessUpdatingRequest = await req.json();
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
  } = body;

  try {
    await connectToMongoDB();
    const updatedBusinessDetails = await userBusines.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true }
    );

    if (!updatedBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "something wrong with the memberId or payloads",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "you have succesfully updated the business details",
        data: updatedBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in updating business details", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const memberBusinessDetails = await userBusines.findById(id);
    if (!memberBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no business details with this id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully fetched the user business details",
        data: memberBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in fetching this business details", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedBusinessDetails = await userBusines.findByIdAndDelete(id);
    if (!deletedBusinessDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "There is no business details with this id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have successfully deleted this business details",
        data: deletedBusinessDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in deleting this business details", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
