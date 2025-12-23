import userPersonal from "@/app/models/admin/UserPersonal";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import { NextResponse } from "next/server";
import Service from "../../../../models/admin/services";
import Chapter from "@/app/models/admin/Chapter";

interface memberUpdatedPersonalRequest {
  nameOfBusinessOwner: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  chapter?: string;
}

export const PUT = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;

  const body: memberUpdatedPersonalRequest = await req.json();

  const {
    nameOfBusinessOwner,
    designation,
    phone,
    secondaryPhone,
    email,
    chapter,
  } = body;

  try {
    await connectToMongoDB();

    if (chapter) {
      const chapterExists = await Chapter.findById(chapter);
      if (!chapterExists) {
        return NextResponse.json(
          {
            status: "Failed",
            message: "Chapter not found!",
          },
          { status: 404 }
        );
      }
    }

    const updatingMemberPersonalDetails = await userPersonal.findByIdAndUpdate(
      id,
      {
        nameOfBusinessOwner,
        designation,
        phone,
        secondaryPhone,
        email,
        chapter,
      },
      { new: true }
    );

    if (!updatingMemberPersonalDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "Something wrong with the id or payloads",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You succesfully updated the personal details",
        data: updatingMemberPersonalDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in updating member personal details", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const GET = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();

    const memberPersonalDetails = await userPersonal
      .findById(id)
      .populate("chapter");
    if (!memberPersonalDetails) {
      return NextResponse.json(
        {
          status: "Failed",
          message: "no personal data with this particular Id",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully retrived a user personal data",
        data: memberPersonalDetails,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Somethig wrong with retreiving the user personal data", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { id: String } }
) => {
  const { id } = params;
  try {
    await connectToMongoDB();
    const deletedMember = await userPersonal.findByIdAndDelete(id);
    if (!deletedMember) {
      return NextResponse.json({
        status: "Failed",
        message: "Something wrong with the id or payloads",
      });
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "You have succesfully deleted a member",
        data: deletedMember,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error in deleting the member", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
