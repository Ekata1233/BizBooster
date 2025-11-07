// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import Provider from '@/models/Provider';
// import ProviderWallet from '@/models/ProviderWallet';
// import ProviderBankDetails from '@/models/ProviderBankDetails';

// const corsHeaders = {
//     'Access-Control-Allow-Origin': '*',
//     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// // ✅ Preflight handler
// export async function OPTIONS() {
//     return NextResponse.json({}, { headers: corsHeaders });
// }

// // ✅ Main GET handler
// export async function GET(req: NextRequest) {
//     try {
//         await connectToDatabase();

//         const { searchParams } = new URL(req.url);
//         const search = searchParams.get('search');
//         const sort = searchParams.get('sort');
//         const startDate = searchParams.get('startDate');
//         const endDate = searchParams.get('endDate');

//         const filter: Record<string, any> = {};

//         // 🔍 Search filter
//         if (search) {
//             const regex = { $regex: search, $options: 'i' };
//             filter.$or = [
//                 { 'storeInfo.storeName': regex },
//                 { 'storeInfo.storeEmail': regex },
//                 { phoneNo: regex },
//                 { email: regex },
//             ];
//         }

//         // 🗓 Date filter
//         if (startDate || endDate) {
//             const dateFilter: { $gte?: Date; $lte?: Date } = {};
//             if (startDate) dateFilter.$gte = new Date(startDate);
//             if (endDate) {
//                 const end = new Date(endDate);
//                 end.setHours(23, 59, 59, 999);
//                 dateFilter.$lte = end;
//             }
//             filter.createdAt = dateFilter;
//         }

//         // ↕ Sorting
//         let sortOption: Record<string, 1 | -1> = {};
//         switch (sort) {
//             case 'latest':
//                 sortOption = { createdAt: -1 };
//                 break;
//             case 'oldest':
//                 sortOption = { createdAt: 1 };
//                 break;
//             case 'ascending':
//                 sortOption = { 'storeInfo.storeName': 1 };
//                 break;
//             case 'descending':
//                 sortOption = { 'storeInfo.storeName': -1 };
//                 break;
//             default:
//                 sortOption = { createdAt: -1 };
//         }

//         // 🧩 Fetch providers
//         const providers = await Provider.find(filter)
//             .sort(sortOption)
//             .select('providerId storeInfo.storeName storeInfo.storePhone storeInfo.storeEmail storeInfo.logo email phoneNo')
//             .lean();

//         // ⚙️ Combine wallet + bank data
//         const enrichedProviders = await Promise.all(
//             providers.map(async (provider) => {
//                 const wallet = await ProviderWallet.findOne({ providerId: provider._id }).lean();
//                 const bank = await ProviderBankDetails.findOne({ providerId: provider._id }).lean();

//                 return {
//                     providerId: provider.providerId,
//                     storeName: provider.storeInfo?.storeName || '',
//                     storePhone: provider.storeInfo?.storePhone || '',
//                     storeEmail: provider.storeInfo?.storeEmail || '',
//                     logo: provider.storeInfo?.logo || '',

//                     // 💰 Wallet info
//                     wallet: wallet
//                         ? {
//                             balance: wallet.balance,
//                             upiId: wallet.upiId,
//                             receivableBalance: wallet.receivableBalance,
//                             withdrawableBalance: wallet.withdrawableBalance,
//                             pendingWithdraw: wallet.pendingWithdraw,
//                             alreadyWithdrawn: wallet.alreadyWithdrawn,
//                             totalEarning: wallet.totalEarning,
//                             totalCredits: wallet.totalCredits,
//                             totalDebits: wallet.totalDebits,
//                             cashInHand: wallet.cashInHand,
//                             adjustmentCash: wallet.adjustmentCash,
//                             isActive: wallet.isActive,
//                         }
//                         : null,

//                     // 🏦 Bank info
//                     bankDetails: bank
//                         ? {
//                             accountNumber: bank.accountNumber,
//                             ifsc: bank.ifsc,
//                             bankName: bank.bankName,
//                             branchName: bank.branchName,
//                             isActive: bank.isActive,
//                         }
//                         : null,
//                 };
//             })
//         );

//         return NextResponse.json(
//             {
//                 success: true,
//                 count: enrichedProviders.length,
//                 data: enrichedProviders,
//             },
//             { status: 200, headers: corsHeaders }
//         );
//     } catch (error: any) {
//         console.error('❌ Error fetching provider summary:', error);
//         return NextResponse.json(
//             { success: false, message: error.message || 'Internal Server Error' },
//             { status: 500, headers: corsHeaders }
//         );
//     }
// }


// import { NextRequest, NextResponse } from 'next/server';
// import { connectToDatabase } from '@/utils/db';
// import Provider from '@/models/Provider';
// import ProviderWallet from '@/models/ProviderWallet';
// import ProviderBankDetails from '@/models/ProviderBankDetails';
// import User from '@/models/User';
// import Wallet from '@/models/Wallet';
// import UserBankDetails from '@/models/UserBankDetails';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// export async function GET(req: NextRequest) {
//   try {
//     await connectToDatabase();

//     const { searchParams } = new URL(req.url);
//     const type = searchParams.get('type'); // 'provider' | 'user' | null
//     const search = searchParams.get('search');
//     const sort = searchParams.get('sort');
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');

//     const filter: Record<string, any> = {};

//     // 🕵️ Search Filter
//     if (search) {
//       const regex = { $regex: search, $options: 'i' };
//       filter.$or = [
//         { fullName: regex },
//         { email: regex },
//         { mobileNumber: regex },
//         { 'storeInfo.storeName': regex },
//         { 'storeInfo.storeEmail': regex },
//       ];
//     }

//     // 📅 Date Filter
//     if (startDate || endDate) {
//       const dateFilter: { $gte?: Date; $lte?: Date } = {};
//       if (startDate) dateFilter.$gte = new Date(startDate);
//       if (endDate) {
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         dateFilter.$lte = end;
//       }
//       filter.createdAt = dateFilter;
//     }

//     // 🔽 Sorting logic
//     let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
//     switch (sort) {
//       case 'latest':
//         sortOption = { createdAt: -1 };
//         break;
//       case 'oldest':
//         sortOption = { createdAt: 1 };
//         break;
//       case 'ascending':
//         sortOption = { fullName: 1 };
//         break;
//       case 'descending':
//         sortOption = { fullName: -1 };
//         break;
//       default:
//         sortOption = { createdAt: -1 };
//     }

//     // ✅ Helper functions for provider & user fetching
//     const fetchProviders = async () => {
//       const providers = await Provider.find(filter)
//         .sort(sortOption)
//         .select(
//           'providerId storeInfo.storeName storeInfo.storePhone storeInfo.storeEmail storeInfo.logo email phoneNo'
//         )
//         .lean();

//       return Promise.all(
//         providers.map(async (provider) => {
//           const wallet = await ProviderWallet.findOne({
//             providerId: provider._id,
//           }).lean();
//           const bank = await ProviderBankDetails.findOne({
//             providerId: provider._id,
//           }).lean();

//           return {
//             type: 'provider',
//             providerId: provider.providerId,
//             storeName: provider.storeInfo?.storeName || '',
//             storePhone: provider.storeInfo?.storePhone || '',
//             storeEmail: provider.storeInfo?.storeEmail || '',
//             logo: provider.storeInfo?.logo || '',
//             email: provider.email,
//             phoneNo: provider.phoneNo,
//             wallet: wallet
//               ? {
//                   balance: wallet.balance,
//                   upiId: wallet.upiId,
//                   receivableBalance: wallet.receivableBalance,
//                   withdrawableBalance: wallet.withdrawableBalance,
//                   pendingWithdraw: wallet.pendingWithdraw,
//                   alreadyWithdrawn: wallet.alreadyWithdrawn,
//                   totalEarning: wallet.totalEarning,
//                   totalCredits: wallet.totalCredits,
//                   totalDebits: wallet.totalDebits,
//                   cashInHand: wallet.cashInHand,
//                   adjustmentCash: wallet.adjustmentCash,
//                   isActive: wallet.isActive,
//                 }
//               : null,
//             bankDetails: bank
//               ? {
//                   accountNumber: bank.accountNumber,
//                   ifsc: bank.ifsc,
//                   bankName: bank.bankName,
//                   branchName: bank.branchName,
//                   isActive: bank.isActive,
//                 }
//               : null,
//           };
//         })
//       );
//     };

//     const fetchUsers = async () => {
//       const users = await User.find(filter)
//         .sort(sortOption)
//         .select('userId fullName email mobileNumber profilePhoto createdAt')
//         .lean();

//       return Promise.all(
//         users.map(async (user) => {
//           const wallet = await Wallet.findOne({ userId: user._id }).lean();
//           const bank = await UserBankDetails.findOne({
//             userId: user._id,
//           }).lean();

//           return {
//             type: 'user',
//             userId: user.userId,
//             fullName: user.fullName,
//             email: user.email,
//             mobileNumber: user.mobileNumber,
//             profilePhoto: user.profilePhoto || '',
//             wallet: wallet
//               ? {
//                   balance: wallet.balance,
//                   totalCredits: wallet.totalCredits,
//                   totalDebits: wallet.totalDebits,
//                   selfEarnings: wallet.selfEarnings,
//                   referralEarnings: wallet.referralEarnings,
//                   isActive: wallet.isActive,
//                 }
//               : null,
//             bankDetails: bank
//               ? {
//                   accountNumber: bank.accountNumber,
//                   ifsc: bank.ifsc,
//                   bankName: bank.bankName,
//                   branchName: bank.branchName,
//                   isActive: bank.isActive,
//                 }
//               : null,
//           };
//         })
//       );
//     };

//     // 🚀 Data Fetching Logic
//     let data: any[] = [];

//     if (type === 'provider') {
//       data = await fetchProviders();
//     } else if (type === 'user') {
//       data = await fetchUsers();
//     } else {
//       // no type => fetch both
//       const [providers, users] = await Promise.all([
//         fetchProviders(),
//         fetchUsers(),
//       ]);
//       data = [...providers, ...users];
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         count: data.length,
//         data,
//       },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     console.error('❌ Error fetching details:', error);
//     return NextResponse.json(
//       { success: false, message: error.message || 'Internal Server Error' },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/db';
import Provider from '@/models/Provider';
import ProviderWallet from '@/models/ProviderWallet';
import ProviderBankDetails from '@/models/ProviderBankDetails';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import UserBankDetails from '@/models/UserBankDetails';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'provider' | 'user' | null
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    // 🔍 Search Filter
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { mobileNumber: regex },
        { 'storeInfo.storeName': regex },
        { 'storeInfo.storeEmail': regex },
      ];
    }

    // 🗓 Date Filter
    if (startDate || endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.createdAt = dateFilter;
    }

    // ↕ Sorting
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (sort) {
      case 'latest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'ascending': sortOption = { fullName: 1 }; break;
      case 'descending': sortOption = { fullName: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    // ✅ Fetch functions
    const fetchProviders = async () => {
      const total = await Provider.countDocuments(filter);
      const providers = await Provider.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('providerId storeInfo.storeName storeInfo.storePhone storeInfo.storeEmail storeInfo.logo email phoneNo')
        .lean();

      const enriched = await Promise.all(
        providers.map(async (provider) => {
          const wallet = await ProviderWallet.findOne({ providerId: provider._id }).lean();
          const bank = await ProviderBankDetails.findOne({ providerId: provider._id }).lean();

          return {
            type: 'provider',
            providerId: provider.providerId,
            storeName: provider.storeInfo?.storeName || '',
            storePhone: provider.storeInfo?.storePhone || '',
            storeEmail: provider.storeInfo?.storeEmail || '',
            logo: provider.storeInfo?.logo || '',
            email: provider.email,
            phoneNo: provider.phoneNo,
            wallet: wallet ? {
              balance: wallet.balance,
              totalEarning: wallet.totalEarning,
              totalCredits: wallet.totalCredits,
              totalDebits: wallet.totalDebits,
              pendingWithdraw: wallet.pendingWithdraw,
              alreadyWithdrawn: wallet.alreadyWithdrawn,
              transactions: wallet.transactions
                    .reverse() || [],
            } : null,
            bankDetails: bank ? {
              accountNumber: bank.accountNumber,
              ifsc: bank.ifsc,
              bankName: bank.bankName,
              branchName: bank.branchName,
            } : null,
          };
        })
      );

      return { data: enriched, total };
    };

    const fetchUsers = async () => {
      const total = await User.countDocuments(filter);
      const users = await User.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .select('userId fullName email mobileNumber profilePhoto createdAt')
        .lean();

      const enriched = await Promise.all(
        users.map(async (user) => {
          const wallet = await Wallet.findOne({ userId: user._id }).lean();
          const bank = await UserBankDetails.findOne({ userId: user._id }).lean();

          return {
            type: 'user',
            userId: user.userId,
            fullName: user.fullName,
            email: user.email,
            mobileNumber: user.mobileNumber,
            profilePhoto: user.profilePhoto || '',
            wallet: wallet ? {
              balance: wallet.balance,
              totalCredits: wallet.totalCredits,
              totalDebits: wallet.totalDebits,
              pendingWithdraw: wallet.pendingWithdraw,
              alreadyWithdrawn: wallet.alreadyWithdrawn,
              selfEarnings: wallet.selfEarnings,
              referralEarnings: wallet.referralEarnings,
              transactions: wallet.transactions
                    .reverse() || [],
            } : null,
            bankDetails: bank ? {
              accountNumber: bank.accountNumber,
              ifsc: bank.ifsc,
              bankName: bank.bankName,
              branchName: bank.branchName,
            } : null,
          };
        })
      );

      return { data: enriched, total };
    };

    // 🚀 Data Fetching Logic
    let combinedData: any[] = [];
    let total = 0;

    if (type === 'provider') {
      const { data, total: totalCount } = await fetchProviders();
      combinedData = data;
      total = totalCount;
    } else if (type === 'user') {
      const { data, total: totalCount } = await fetchUsers();
      combinedData = data;
      total = totalCount;
    } else {
      const [providers, users] = await Promise.all([fetchProviders(), fetchUsers()]);
      combinedData = [...providers.data, ...users.data];
      total = providers.total + users.total;
    }

    return NextResponse.json(
      {
        success: true,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        count: combinedData.length,
        data: combinedData,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('❌ Error fetching details:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
