import mongoose, { Schema, Document } from "mongoose"

interface ICoordinate {
  lat: number
  lng: number
}

export interface IZone extends Document {
  name: string
  coordinates: ICoordinate[]
  createdAt?: Date
  updatedAt?: Date
  isPanIndia: boolean;
  isDeleted?: boolean
}

const coordinateSchema = new Schema<ICoordinate>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
})

const zoneSchema = new Schema<IZone>(
  {
    name: { type: String, required: true },
    coordinates: {
      type: [coordinateSchema],
      required: true,
      validate: {
        validator: function (this: IZone, v: ICoordinate[]) {
          if (this.isPanIndia) return true; // skip validation for PAN INDIA
          return v && v.length >= 3;
        },
        message: "A zone must have at least 3 coordinates.",
      },
    },
    isPanIndia: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.Zone || mongoose.model<IZone>("Zone", zoneSchema)
