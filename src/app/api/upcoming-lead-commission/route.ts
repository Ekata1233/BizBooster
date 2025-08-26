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

//     const leadAmount =  checkout.subtotal;
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

    const rawCommission = checkout.service?.franchiseDetails?.commission;
    const commission = rawCommission;

    const leadAmount = checkout.subtotal;
    const extraLeadAmount = Array.isArray(lead?.extraService)
      ? lead.extraService.reduce(
        (sum: number, item: { total?: number }) => sum + (item.total || 0),
        0
      )
      : 0;

    const extraCommission =
      Array.isArray(lead?.extraService) && lead?.extraService.length > 0
        ? lead?.extraService[0]?.commission || 0
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

    // Conditional shares (0 if user missing/inactive)
    const C_share =
      userC?.packageActive ? toFixed2(commissionPool * 0.5) : 0;
    const B_share = userB ? toFixed2(commissionPool * 0.2) : 0;
    const A_share = userA ? toFixed2(commissionPool * 0.1) : 0;

    // Admin gets leftover
    const adminShare = toFixed2(
      commissionPool - (C_share + B_share + A_share)
    );

    // ---------------- EXTRA COMMISSION ----------------
    let extra_C_share = 0,
      extra_B_share = 0,
      extra_A_share = 0,
      extra_adminShare = 0,
      extra_providerShare = 0;

    if (extraLeadAmount > 0) {
      let extraCommissionPool = 0;

      if (typeof extraCommission === "string") {
        const trimmed = extraCommission.trim();
        if (trimmed.endsWith("%")) {
          const percent = parseFloat(trimmed.replace("%", ""));
          extraCommissionPool = (extraLeadAmount * percent) / 100;
        } else {
          extraCommissionPool = parseFloat(trimmed.replace("₹", "").trim());
        }
        extra_providerShare = extraLeadAmount - extraCommissionPool;
      } else {
        extraCommissionPool = extraCommission;
        extra_providerShare = extraLeadAmount - extraCommissionPool;
      }

      extra_C_share =
        userC?.packageActive ? toFixed2(extraCommissionPool * 0.5) : 0;
      extra_B_share = userB ? toFixed2(extraCommissionPool * 0.2) : 0;
      extra_A_share = userA ? toFixed2(extraCommissionPool * 0.1) : 0;

      extra_adminShare = toFixed2(
        extraCommissionPool - (extra_C_share + extra_B_share + extra_A_share)
      );
    }

    // ---------------- CHECK IF ALREADY DISTRIBUTED ----------------
    const existingCommission = await UpcomingCommission.findOne({ checkoutId });
    if (existingCommission) {
      return NextResponse.json(
        {
          success: false,
          message: "Commission already distributed for this Lead.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ---------------- SAVE ----------------
    await UpcomingCommission.create({
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
