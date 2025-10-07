import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../libs/mongodb";
import Favorite from "../../../../app/models/favorites/favoriteModel";
import UserPersonal from "../../../../app/models/admin/UserPersonal";
import UserBusiness from "../../../../app/models/admin/UserBusiness";
import UserService from "../../../models/admin/UserSerivce";
import UserTestimonial from "../../../../app/models/admin/UserTestimonial";

// Add to favorites
export async function POST(req: Request) {
  try {
    await connectToMongoDB();
    const { memberId, favoriteMemberId } = await req.json();

    if (!memberId || !favoriteMemberId) {
      return NextResponse.json(
        { error: "Member ID and Favorite Member ID are required" },
        { status: 400 }
      );
    }

    // Prevent adding self to favorites
    if (memberId === favoriteMemberId) {
      return NextResponse.json(
        { error: "Cannot add yourself to favorites" },
        { status: 400 }
      );
    }

    // Verify that the favoriteMemberId exists
    const memberExists = await UserPersonal.findOne({ memberId: favoriteMemberId });
    if (!memberExists) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const favorite = await Favorite.create({
      memberId,
      favoriteMemberId,
    });

    return NextResponse.json(
      { message: "Added to favorites successfully", favorite },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Member already in favorites" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    );
  }
}

// Get all favorites for a member
export async function GET(req: Request) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    const favorites = await Favorite.find({ memberId }).sort({ createdAt: -1 });

    // Fetch complete details for each favorite member
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        // Get personal, business and testimonial details
        const [personal, business, testimonial] = await Promise.all([
          UserPersonal.findOne({ memberId: favorite.favoriteMemberId }),
          UserBusiness.findOne({ memberId: favorite.favoriteMemberId }),
          UserTestimonial.findOne({ memberId: favorite.favoriteMemberId })
        ]);
        
        // Get service details with populated service information
        const service = await UserService.findOne({ memberId: favorite.favoriteMemberId })
          .populate({
            path: 'serviceId',
            model: 'services',
            select: 'serviceTitle serviceImage' // Select the fields you want
          });

        return {
          _id: favorite._id,
          memberId: favorite.memberId,
          favoriteMemberId: favorite.favoriteMemberId,
          createdAt: favorite.createdAt,
          memberDetails: {
            personal,
            business,
            service,
            testimonial
          }
        };
      })
    );

    return NextResponse.json({status : "success", message : "Fetched favorites successfully", data : favoritesWithDetails}, {status : 200});
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
