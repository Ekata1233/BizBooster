import mongoose, { Schema, Document } from "mongoose";
import ServiceBase from "../ServiceBase";

/* ------------------------ TYPESCRIPT INTERFACE ------------------------ */

export interface IFranchiseService extends Document {
  investmentRange: {
    min: number;
    max: number;
    currency: string;
  };
  monthlyEarningPotential: {
    min: number;
    max: number;
    currency: string;
  };
  operatingCities: number;
  about: string;
  establishedDate: Date;
  firstFranchiseDate: Date;
  totalOutlets: number;
  profitMargin: number;
  activePartners: number;
  cities: number;
  years: number;

  franchiseOperatingModel: {
    shortDescription: string;
    items: {
      image: string;
      title: string;
      description: string;
    }[];
  };

  businessFundamentals: {
    shortDescription: string;
    items: {
      title: string;
      description: string;
    }[];
  };

  franchiseModel: {
    modelType: string;
    price: string;
    agreement: string;
    gst: string;
    franchiseFees: string;
  }[];

  keyAdvantages: {
    title: string;
    description: string;
  }[];

  CompleteSupportSystem: {
    title: string;
    description: string[];
  }[];

  trainingDetails: {
    title: string;
    description: string;
  }[];

  agreementDetails: {
    title: string;
    description: string;
  }[];

  goodThings: string[];
  thingsToImprove: string[];

  compareAndChoose: {
    name: string;
    investmentRange: string;
    monthlyIncome: string;
    roiPeriod: string;
    targetArea: string;
  }[];

  companyDetails: {
    businessName: string;
    companyType: string;
    ownerName: string;
    founderName: string;
  };
}

/* ------------------------ SCHEMA ------------------------ */

const FranchiseServiceSchema = new Schema<IFranchiseService>(
  {
    investmentRange: {
      min: Number,
      max: Number,
    },

    monthlyEarningPotential: {
      min: Number,
      max: Number,
    },

    operatingCities: Number,
    about: String,
    establishedDate: Date,
    firstFranchiseDate: Date,
    totalOutlets: Number,
    profitMargin: Number,
    activePartners: Number,
    cities: Number,
    years: Number,

    franchiseOperatingModel: {
      shortDescription: String,
      items: [
        {
          image: String,
          title: String,
          description: String,
        },
      ],
    },

    businessFundamentals: {
      shortDescription: String,
      items: [
        {
          title: String,
          description: String,
        },
      ],
    },

    franchiseModel: [
      {
        modelType: String,
        price: String,
        agreement: String,
        gst: String,
        franchiseFees: String,
      },
    ],

    keyAdvantages: [
      {
        title: String,
        description: String,
      },
    ],

    CompleteSupportSystem: [
      {
        title: String,
        description: [String],
      },
    ],

    trainingDetails: [
      {
        title: String,
        description: String,
      },
    ],

    agreementDetails: [
      {
        title: String,
        description: String,
      },
    ],
    goodThings: [String],
    thingsToImprove: [String],
    compareAndChoose: [
      {
        name: String,
        investmentRange: String,
        monthlyIncome: String,
        roiPeriod: String,
        targetArea: String,
      },
    ],
    companyDetails: {
      title: String,
      description : String,
      businessName: String,
      companyType: String,
      ownerName: String,
      founderName: String,
    },
  },
  { timestamps: true }
);

/* ------------------------ DISCRIMINATOR ------------------------ */

const FranchiseService = ServiceBase.discriminator<IFranchiseService>(
  "FranchiseService",
  FranchiseServiceSchema
);

export default FranchiseService;
