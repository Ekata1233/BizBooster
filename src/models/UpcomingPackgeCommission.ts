import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUpcomingPackageCommisson extends Document {
  commissionFrom: Types.ObjectId;
  share_1: number;
  share_2: number;
  admin_commission: number;
  status: "pending" | "distributed";
  createdAt: Date;
  updatedAt: Date;
}

const UpcomingPackageCommissonSchema = new Schema<IUpcomingPackageCommisson>(
  {
    commissionFrom: { type: Schema.Types.ObjectId, ref: "User", required: true },
    share_1: { type: Number, default: 0 },
    share_2: { type: Number, default: 0 },
    admin_commission: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "distributed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.UpcomingPackageCommisson ||
  mongoose.model<IUpcomingPackageCommisson>(
    "UpcomingPackageCommisson",
    UpcomingPackageCommissonSchema
  );
