// import { NextResponse } from "next/server";
// import { Types } from "mongoose";
// import Checkout from "@/models/Checkout";
// import Lead from "@/models/Lead";
// import User from "@/models/User";
// import { connectToDatabase } from "@/utils/db";
// import UpcomingCommission from "@/models/UpcomingCommission";
// import "@/models/Service"
// import "@/models/Lead"

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// function toFixed2(num: number): number {
//   return Math.round((num + Number.EPSILON) * 100) / 100;
// }

// export async function POST(req: Request) {
//   await connectToDatabase();

//   try {
//     const { checkoutId } = await req.json();

//     if (!checkoutId) {
//       return NextResponse.json(
//         { success: false, message: "Missing checkoutId" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const lead = await Lead.findOne({ checkout: checkoutId });
//     const checkout = await Checkout.findById(checkoutId)
//       .populate("user")
//       .populate({
//         path: "service",
//         select: "franchiseDetails.commission"
//       });

//     if (!checkout) {
//       return NextResponse.json(
//         { success: false, message: "Checkout not found" },
//         { status: 404, headers: corsHeaders }
//       );
//     }

//     const rawCommission = checkout.service?.franchiseDetails?.commission;
//     const commission = rawCommission;

//     const leadAmount =  checkout.priceAfterDiscount;
//     const extraLeadAmount = Array.isArray(lead?.extraService)
//       ? lead.extraService.reduce((sum: number, item: { total?: number }) => sum + (item.total || 0), 0)
//       : 0;

//     const extraCommission = Array.isArray(lead?.extraService) && lead?.extraService.length > 0
//       ? (lead?.extraService[0]?.commission) || 0
//       : 0;

//     const userC = checkout.user;
//     const userB = userC.referredBy ? await User.findById(userC.referredBy) : null;
//     const userA = userB?.referredBy ? await User.findById(userB.referredBy) : null;

//     // Calculate main commission pool
//     let commissionPool = 0;
//     let providerShare = 0;

//     if (typeof commission === "string") {
//       const trimmed = commission.trim();
//       if (trimmed.endsWith("%")) {
//         const percent = parseFloat(trimmed.replace("%", ""));
//         commissionPool = (leadAmount * percent) / 100;
//       } else {
//         commissionPool = parseFloat(trimmed.replace("₹", "").trim());
//       }
//       providerShare = leadAmount - commissionPool;
//     } else {
//       commissionPool = commission;
//       providerShare = leadAmount - commissionPool;
//     }

//     const C_share = toFixed2(commissionPool * 0.5);
//     const B_share = toFixed2(commissionPool * 0.2);
//     const A_share = toFixed2(commissionPool * 0.1);
//     let adminShare = toFixed2(commissionPool * 0.2);

//     if (!userB) adminShare += B_share;
//     if (!userA) adminShare += A_share;
//     if (!userC?.packageActive) adminShare += C_share;

//     // Calculate extra service commission
//     let extra_C_share = 0, extra_B_share = 0, extra_A_share = 0, extra_adminShare = 0, extra_providerShare = 0;

//     if (extraLeadAmount > 0) {
//       let extraCommissionPool = 0;
//       if (typeof extraCommission === "string") {
//         const trimmed = extraCommission.trim();
//         if (trimmed.endsWith("%")) {
//           const percent = parseFloat(trimmed.replace("%", ""));
//           extraCommissionPool = (extraLeadAmount * percent) / 100;
//         } else {
//           extraCommissionPool = parseFloat(trimmed.replace("₹", "").trim());
//         }
//         extra_providerShare = extraLeadAmount - extraCommissionPool;
//       } else {
//         extraCommissionPool = extraCommission;
//         extra_providerShare = extraLeadAmount - extraCommissionPool;
//       }

//       extra_C_share = toFixed2(extraCommissionPool * 0.5);
//       extra_B_share = toFixed2(extraCommissionPool * 0.2);
//       extra_A_share = toFixed2(extraCommissionPool * 0.1);
//       extra_adminShare = toFixed2(extraCommissionPool * 0.2);

//       if (!userB) extra_adminShare += extra_B_share;
//       if (!userA) extra_adminShare += extra_A_share;
//       if (!userC?.packageActive) extra_adminShare += extra_C_share;
//     }

//     // Save the commission breakdown
//     await UpcomingCommission.create({
//       leadId: lead._id,
//       checkoutId: checkout._id,
//       userC_share: C_share,
//       userB_share: B_share,
//       userA_share: A_share,
//       admin_commission: adminShare,
//       provider_share: providerShare,
//       extra_C_share,
//       extra_B_share,
//       extra_A_share,
//       extra_admin_commission: extra_adminShare,
//       extra_providerShare
//     });

//     return NextResponse.json(
//       { success: true, message: "Commission preview saved successfully." },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error("Preview commission failed:", error.message);
//     return NextResponse.json(
//       { success: false, message: error.message || "Unknown error" },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { Types } from "mongoose";
import Checkout from "@/models/Checkout";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";
import UpcomingCommission from "@/models/UpcomingCommission";
import "@/models/Service";
import "@/models/Lead";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function toFixed2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const { checkoutId } = await req.json();

    if (!checkoutId) {
      return NextResponse.json(
        { success: false, message: "Missing checkoutId" },
        { status: 400, headers: corsHeaders }
      );
    }

    const lead = await Lead.findOne({ checkout: checkoutId });

    const checkout = await Checkout.findById(checkoutId)
      .populate("user")
      .populate({
        path: "service",
        select: "franchiseDetails.commission",
      });

    if (!checkout) {
      return NextResponse.json(
        { success: false, message: "Checkout not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const rawCommission = checkout.commission ?? checkout.service?.franchiseDetails?.commission;
    const commission = rawCommission;

    const leadAmount = checkout.priceAfterDiscount;
    const extraLeadAmount = Array.isArray(lead?.extraService)
      ? lead.extraService.reduce(
        (sum: number, item: { total?: number }) => sum + (item.total || 0),
        0
      )
      : 0;

    const extraCommission = Array.isArray(lead?.extraService) && lead?.extraService.length > 0
      ? (lead?.extraService[0]?.commission) || 0
      : 0;

    const userC = checkout.user;
    const userB = userC?.referredBy
      ? await User.findById(userC.referredBy)
      : null;
    const userA = userB?.referredBy
      ? await User.findById(userB.referredBy)
      : null;

    // ---------------- MAIN COMMISSION ----------------
    let commissionPool = 0;
    let providerShare = 0;

    if (typeof commission === "string") {
      const trimmed = commission.trim();
      if (trimmed.endsWith("%")) {
        const percent = parseFloat(trimmed.replace("%", ""));
        commissionPool = (leadAmount * percent) / 100;
      } else {
        commissionPool = parseFloat(trimmed.replace("₹", "").trim());
      }
      providerShare = leadAmount - commissionPool;
    } else {
      commissionPool = commission;
      providerShare = leadAmount - commissionPool;
    }

    // OLD CODE UPTO 06 OCT
    // const C_share =
    //   userC?.packageActive ? toFixed2(commissionPool * 0.5) : 0;
    // const B_share = userB ? toFixed2(commissionPool * 0.2) : 0;
    // const A_share = userA ? toFixed2(commissionPool * 0.1) : 0;
    // const adminShare = toFixed2(
    //   commissionPool - (C_share + B_share + A_share)
    // );

    //NEW CODE FROM 6 OCT 
    let adminShare = 0;

    // Shares only if user exists & not deleted
    const validC = userC && !userC.isDeleted && userC.packageActive;
    const validB = userB && !userB.isDeleted;
    const validA = userA && !userA.isDeleted;

    const C_share = validC ? toFixed2(commissionPool * 0.5) : 0;
    const B_share = validB ? toFixed2(commissionPool * 0.2) : 0;
    const A_share = validA ? toFixed2(commissionPool * 0.1) : 0;
    adminShare = toFixed2(commissionPool - (C_share + B_share + A_share));

    // ---------------- EXTRA COMMISSION ----------------
    let extra_C_share = 0,
      extra_B_share = 0,
      extra_A_share = 0,
      extra_adminShare = 0,
      extra_providerShare = 0,
      extraCommissionPool = 0;

    if (extraLeadAmount > 0 && extraCommission) {
      if (typeof extraCommission === "string") {
        const trimmed = extraCommission.trim();

        if (trimmed.endsWith("%")) {
          const percent = parseFloat(trimmed.replace("%", ""));
          extraCommissionPool = (extraLeadAmount * percent) / 100;
        } else if (/^₹?\d+(\.\d+)?$/.test(trimmed)) {
          const numericString = trimmed.replace("₹", "").trim();
          extraCommissionPool = parseFloat(numericString);
        } else {
          throw new Error("Invalid commission format. Must be a percentage (e.g. '30%') or a fixed amount like '₹2000' or '2000'.");
        }


        extra_providerShare = extraLeadAmount - extraCommissionPool;
      } else if (typeof extraCommission === "number") {
        extraCommissionPool = extraCommission;
        extra_providerShare = extraLeadAmount - extraCommissionPool;
      }

      console.log("extraCommissionPool : ", extraCommissionPool);

      //NEW CODE FROM THE 06 OCT
      const validExtraC = userC && !userC.isDeleted && userC.packageActive;
      const validExtraB = userB && !userB.isDeleted;
      const validExtraA = userA && !userA.isDeleted;

      extra_C_share = validExtraC ? toFixed2(extraCommissionPool * 0.5) : 0;
      extra_B_share = validExtraB ? toFixed2(extraCommissionPool * 0.2) : 0;
      extra_A_share = validExtraA ? toFixed2(extraCommissionPool * 0.1) : 0;

      extra_adminShare = toFixed2(extraCommissionPool - (extra_C_share + extra_B_share + extra_A_share));

      console.log("extra_C_share : ", extra_C_share);
      console.log("extra_B_share : ", extra_B_share);
      console.log("extra_A_share : ", extra_A_share);
      console.log("extra_adminShare : ", extra_adminShare);
      console.log("extra_providerShare : ", extra_providerShare);

    }

    //OLD CODE TILL 6 OCT
    // if (extraLeadAmount > 0) {
    //   extra_C_share =
    //     userC?.packageActive ? toFixed2(extraCommissionPool * 0.5) : 0;
    //   extra_B_share = userB ? toFixed2(extraCommissionPool * 0.2) : 0;
    //   extra_A_share = userA ? toFixed2(extraCommissionPool * 0.1) : 0;

    //   extra_adminShare = toFixed2(extraCommissionPool * 0.2);
    //   if (!userB || userB.isDeleted) extra_adminShare += extra_B_share;
    //   if (!userA || userA.isDeleted) extra_adminShare += extra_A_share;
    // }
    // ---------------- CHECK IF ALREADY DISTRIBUTED ----------------
    const existingCommission = await UpcomingCommission.findOne({ checkoutId });
    // if (existingCommission) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       message: "Commission already distributed for this Lead.",
    //     },
    //     { status: 400, headers: corsHeaders }
    //   );
    // }

    if (existingCommission) {
      // Add extra commission to existing shares
      existingCommission.extra_share_1 += extra_C_share;
      existingCommission.extra_share_2 += extra_B_share;
      existingCommission.extra_share_3 += extra_A_share;
      existingCommission.extra_admin_commission += extra_adminShare;
      existingCommission.extra_provider_share += extra_providerShare;

      await existingCommission.save();

      return NextResponse.json({
        success: true,
        message: "Extra commission added successfully.",
      }, { status: 200, headers: corsHeaders });
    }

    // ---------------- SAVE ----------------
    const newCommission = await UpcomingCommission.create({
      leadId: lead ? lead._id : null,
      checkoutId: checkout._id,
      share_1: C_share,
      share_2: B_share,
      share_3: A_share,
      admin_commission: adminShare,
      provider_share: toFixed2(providerShare),
      extra_share_1: extra_C_share,
      extra_share_2: extra_B_share,
      extra_share_3: extra_A_share,
      extra_admin_commission: extra_adminShare,
      extra_provider_share: toFixed2(extra_providerShare),
    });

    console.log("🧾 UpcomingCommission saved:", newCommission.toObject());

    return NextResponse.json(
      { success: true, message: "Commission preview saved successfully." },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Preview commission failed:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Unknown error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
