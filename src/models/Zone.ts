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
        validator: (v: ICoordinate[]) => v.length >= 3,
        message: "A zone must have at least 3 coordinates.",
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.models.Zone || mongoose.model<IZone>("Zone", zoneSchema)
