import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import userPersonal from "../../../../../app/models/admin/UserPersonal";
import userBusines from "../../../../../app/models/admin/UserBusiness";
import userservice from "../../../.././../app/models/admin/UserSerivce";
import UsersTestimonial from "../../../../../app/models/admin/UserTestimonial";

export const GET = async (req: Request) => {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);

    const keyword = searchParams.get("keyword")?.trim() || "";

    if (keyword.length === 0) {
      return NextResponse.json(
        {
          message: "Keyword is required for search",
          data: [],
          totalRecords: 0,
        },
        { status: 400 }
      );
    }

    const searchQuery = {
      $or: [
        { nameOfBusinessOwner: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { address: { $regex: keyword, $options: "i" } },
        { nameOfBusiness: { $regex: keyword, $options: "i" } },
      ],
    };

    const searchedMemberFromPersonalDetails = await userPersonal
      .find(searchQuery)
      .sort({ nameOfBusinessOwner: 1 })
      .lean();

    const searchMemberFromBusinessDetails = await userBusines
      .find(searchQuery)
      .sort({ nameOfBusiness: 1 })
      .lean();

    const getFullMemberDetails = async (item: any, type: any, index: any) => {
      const memberPersonal =
        type === "personal"
          ? item
          : await userPersonal.findOne({ memberId: item.memberId }).lean();
      const memberBusiness =
        type === "business"
          ? item
          : await userBusines.findOne({ memberId: item.memberId }).lean();
      const memberService = await userservice
        .findOne({ memberId: item.memberId })
        .lean();
      const memberTestimonial = await UsersTestimonial.findOne({
        memberId: item.memberId,
      }).lean();

      return {
        No: index + 1,
        member_personal_detail: memberPersonal || null,
        member_business_detail: memberBusiness || null,
        member_service_detail: memberService || null,
        member_testimonial_details: memberTestimonial || null,
      };
    };

    const membersFromPersonal = await Promise.all(
      searchedMemberFromPersonalDetails.map((item, index) =>
        getFullMemberDetails(item, "personal", index)
      )
    );

    const membersFromBusiness = await Promise.all(
      searchMemberFromBusinessDetails.map((item, index) =>
        getFullMemberDetails(item, "business", index)
      )
    );

    const fullDetails = [...membersFromPersonal, ...membersFromBusiness];

    return NextResponse.json(
      {
        data: fullDetails,
        totalRecords: fullDetails.length,
        message:
          fullDetails.length > 0
            ? `Found ${fullDetails.length} matching records`
            : "No matching records found",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Error while searching a user", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
