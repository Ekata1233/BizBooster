import mongoose from "mongoose";

const mostHomeServicesSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      unique: true, // one config per service
    },

    mostlyTrending: {
      type: Boolean,
      default: false,
    },

    mostlyRecommended: {
      type: Boolean,
      default: false,
    },

    mostlyPopular: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const MostHomeServices =
  mongoose.models.MostHomeServices ||
  mongoose.model("MostHomeServices", mostHomeServicesSchema);

export default MostHomeServices;
