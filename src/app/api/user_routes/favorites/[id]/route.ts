import { NextResponse } from "next/server";
import { connectToMongoDB } from "../../../../../../libs/mongodb";
import Favorite from "../../../../../app/models/favorites/favoriteModel";

// Remove from favorites
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const favoriteId = params.id;

    const deletedFavorite = await Favorite.findByIdAndDelete(favoriteId);

    if (!deletedFavorite) {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Removed from favorites successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
}
