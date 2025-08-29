import User from "@/models/User";

export async function checkAndUpdateReferralStatus(userId: string) {
  const user = await User.findById(userId);

  if (!user || !user.referredBy) return; // no referrer or user not found

  const parent = await User.findById(user.referredBy);
  if (!parent) return;

  // Step 1: If parent has packageActive -> ensure GP
  if (parent.packageActive && !parent.packageStatus) {
    parent.packageStatus = "GP";
    await parent.save();
  }

  // Step 2: Check if parent has 10 direct referrals with packageActive true
  const referrals = await User.find({ referredBy: parent._id, packageActive: true });
  if (referrals.length >= 3 && parent.packageStatus === "GP") {
    parent.packageStatus = "SGP";
    await parent.save();
  }

  // Step 3: If parent is SGP, check how many referrals are also SGP
  const sgpCount = await User.countDocuments({
    referredBy: parent._id,
    packageStatus: "SGP",
  });
  if (sgpCount >= 1 && parent.packageStatus === "SGP") {
    parent.packageStatus = "PGP";
    await parent.save();
  }
}
