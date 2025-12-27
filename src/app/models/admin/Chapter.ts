import mongoose, { Schema, Document, Model } from "mongoose";
import District from "./District";
import State from "./State";
import Zone from "./Zone";

interface IChapterSchema extends Document {
  chapterName: string;
  zone: mongoose.Types.ObjectId;
  district: mongoose.Types.ObjectId;
  state: mongoose.Types.ObjectId;
}

const ChapterSchema = new Schema(
  {
    chapterName: { type: String, required: true },
    zone: { type: mongoose.Schema.Types.ObjectId, ref: "zone", required: true },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "district",
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "state",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound index to prevent duplicate chapters in the same zone
ChapterSchema.index({ chapterName: 1, zone: 1 }, { unique: true });

const Chapter: Model<IChapterSchema> =
  mongoose.models.chapter || mongoose.model("chapter", ChapterSchema);

export default Chapter;
