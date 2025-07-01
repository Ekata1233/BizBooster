import Lead from "@/models/Lead";
import User from "@/models/User";
import { Types } from "mongoose";

// Replace this with your admin ID or logic
const ADMIN_ID = new Types.ObjectId("64f123456789abcdef123456");

export const distributeLeadCommission = async (leadId: string) => {
  const lead = await Lead.findById(leadId).populate("generatedBy");
  if (!lead || lead.commissionDistributed) return;

  const leadAmount = lead.amount;
  const userC = lead.generatedBy;

  const userB = userC.referredBy
    ? await User.findById(userC.referredBy)
    : null;

  const userA = userB?.referredBy
    ? await User.findById(userB.referredBy)
    : null;

  const commissionPool = leadAmount * 0.2; // 20% of lead amount
  const providerShare = leadAmount * 0.8;

  const C_share = commissionPool * 0.5;
  const B_share = commissionPool * 0.2;
  const A_share = commissionPool * 0.1;
  let adminShare = commissionPool * 0.2;

  // Add B and A shares to admin if missing
  if (!userB) adminShare += B_share;
  if (!userA) adminShare += A_share;

  // Credit Customer C (lead generator)
  userC.walletBalance += C_share;
  await userC.save();
  await ReferralCommission.create({
    fromLead: lead._id,
    receiver: customerC._id,
    amount: C_share,
  });

  // Credit Customer B (referrer of C)
  if (userB) {
    userB.walletBalance += B_share;
    await userB.save();
    await ReferralCommission.create({
      fromLead: lead._id,
      receiver: userB._id,
      amount: B_share,
    });
  }

  // Credit Customer A (referrer of B)
  if (userA) {
    userA.walletBalance += A_share;
    await userA.save();
    await ReferralCommission.create({
      fromLead: lead._id,
      receiver: userA._id,
      amount: A_share,
    });
  }

  // Credit Admin
  if (ADMIN_ID) {
    await ReferralCommission.create({
      fromLead: lead._id,
      receiver: ADMIN_ID,
      amount: adminShare,
    });
    await User.findByIdAndUpdate(
      ADMIN_ID,
      { $inc: { walletBalance: adminShare } },
      { new: true }
    );
  }

  lead.commissionDistributed = true;
  await lead.save();
};
