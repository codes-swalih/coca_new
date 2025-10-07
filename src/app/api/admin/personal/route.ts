import { v4 as uuid } from "uuid";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import userPersonal from "../../../models/admin/UserPersonal";
import { NextResponse } from "next/server";
import userBusines from "../../../../app/models/admin/UserBusiness";
import userservice from "../../../../app/models/admin/UserSerivce";
import usersTestimonial from "@/app/models/admin/UserTestimonial";

interface UserPersonalRequest {
  nameOfBusinessOwner: string;
  designation: string;
  phone: string;
  secondaryPhone: string;
  email: string;
}

export const POST = async (req: Request) => {
  try {
    const memberId = uuid().replaceAll("-", "");

    const body: UserPersonalRequest = await req.json();

    const { nameOfBusinessOwner, designation, phone, secondaryPhone, email } =
      body;

    if (
      !nameOfBusinessOwner ||
      !designation ||
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
      designation,
      phone,
      secondaryPhone,
      email,
      memberId,
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
    const newMemeberBusiness = await userBusines.create({ memberId });
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
