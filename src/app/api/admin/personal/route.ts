import { v4 as uuid } from "uuid";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import userPersonal from "../../../models/admin/UserPersonal";
import { NextResponse } from "next/server";
import userBusines from "../../../../app/models/admin/UserBusiness";
import userservice from "../../../../app/models/admin/UserSerivce";
import usersTestimonial from "@/app/models/admin/UserTestimonial";
import Zone from "@/app/models/admin/Zone";
import Chapter from "@/app/models/admin/Chapter";

interface UserPersonalRequest {
  nameOfBusinessOwner: string;
  businessName: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  chapter?: string;
}

export const POST = async (req: Request) => {
  try {
    const memberId = uuid().replaceAll("-", "");

    const body: UserPersonalRequest = await req.json();

    const {
      nameOfBusinessOwner,
      businessName,
      designation,
      phone,
      secondaryPhone,
      email,
      chapter,
    } = body;

    if (
      !nameOfBusinessOwner ||
      !designation ||
      !businessName ||
      !phone ||
      !secondaryPhone ||
      !email
    ) {
      return NextResponse.json(
        { status: "Failed", message: "Please fill all the required fields" },
        { status: 404 }
      );
    }

    await connectToMongoDB();

    if (chapter) {
      const chapterExist = await Chapter.findById(chapter);
      if (!chapterExist) {
        return NextResponse.json(
          {
            status: "Failed",
            message: "chapter not found!",
          },
          { status: 404 }
        );
      }
    }

    const isAlreadExist = await userPersonal.findOne({ email: email });

    if (isAlreadExist) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "A user with email is already exist! please try with another email",
        },
        { status: 409 }
      );
    }

    const newMember = await userPersonal.create({
      nameOfBusinessOwner,
      businessName,
      designation,
      phone,
      secondaryPhone,
      email,
      memberId,
      chapter,
    });

    if (!newMember) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Something went wrong with uploading member personal details",
        },
        { status: 500 }
      );
    }
    const newMemeberBusiness = await userBusines.create({
      memberId,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    });
    const newMemberService = await userservice.create({ memberId });
    const newMembersTestimonial = await usersTestimonial.create({ memberId });

    console.log("newMemeberBusiness", newMemeberBusiness);
    console.log("newMemberService", newMemberService);
    console.log("newMembersTestimonial", newMembersTestimonial);

    if (!newMemeberBusiness || !newMemberService || !newMembersTestimonial) {
      return NextResponse.json(
        {
          status: "Failed",
          message:
            "Something went wrong with uploading member personal details",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Member personal details succesfully uploaded!",
        data: newMember,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in uploading member personal details:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const allMembers = await userPersonal
      .find()
      .populate("chapter")
      .sort({ createdAt: -1 });

    if (allMembers.length === 0) {
      return NextResponse.json(
        { status: "Failed", message: "No members found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Members fetched successfully",
        data: allMembers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while fetching all members", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
