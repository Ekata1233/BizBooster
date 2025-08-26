import React, { useEffect } from 'react'
import ComponentCard from '../common/ComponentCard'
import { Provider, useProvider } from '@/context/ProviderContext';
import WalletStats from './WalletStats';
import WalletTransaction from './WalletTransaction';

interface Props {
    provider: Provider;
}

const ProviderWallet: React.FC<Props> = ({ provider }) => {
    const { wallet, fetchWalletByProvider, loading, error } = useProvider();
    const providerId = provider?._id;

    useEffect(() => {
        if (providerId) fetchWalletByProvider(providerId);
    }, [providerId]);

    if (loading) return <p>Loading wallet...</p>;

    // If wallet not found or error, show default 0-values
    const defaultWallet = {
        receivableBalance: 0,
        cashInHand: 0,
        balance: 0,
        withdrawableBalance: 0,
        pendingWithdraw: 0,
        alreadyWithdrawn: 0,
        totalEarning: 0,
    };

    const finalWallet = wallet || defaultWallet;


    console.log("wallet : ", wallet)
    return (
        <div className="">
            <ComponentCard title="Wallet ">
                <WalletStats
                    wallet={{
                        receivableBalance: finalWallet.receivableBalance,
                        cashInHand: finalWallet.cashInHand,
                        withdrawableBalance: finalWallet.withdrawableBalance,
                        pendingWithdraw: finalWallet.pendingWithdraw,
                        alreadyWithdrawn: finalWallet.alreadyWithdrawn,
                        totalEarning: finalWallet.totalEarning,
                    }}
                />
            </ComponentCard>
            <ComponentCard title="Transaction ">
               <WalletTransaction wallet={wallet} loading={loading} error={error} />
            </ComponentCard>
        </div>
    )
}

export default ProviderWallet