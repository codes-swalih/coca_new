import mongoose, { Document, Model, Schema } from "mongoose";

interface IFavoriteSchema extends Document {
  memberId: string;  // The member who is adding to favorites
  favoriteMemberId: string;  // The member being added to favorites
  createdAt: Date;
}

const FavoriteSchema: Schema<IFavoriteSchema> = new Schema({
  memberId: { type: String, required: true },
  favoriteMemberId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add a compound index to prevent duplicate favorites
FavoriteSchema.index({ memberId: 1, favoriteMemberId: 1 }, { unique: true });

const Favorite: Model<IFavoriteSchema> =
  mongoose.models.favorite || mongoose.model("favorite", FavoriteSchema);

export default Favorite;
