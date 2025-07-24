import React, { useEffect } from 'react'
import ComponentCard from '../common/ComponentCard'
import { Provider, useProvider } from '@/context/ProviderContext';
import WalletStats from './WalletStats';

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
                        withdrawableBalance: finalWallet.balance,
                        pendingWithdraw: finalWallet.balance,
                        alreadyWithdrawn: finalWallet.alreadyWithdrawn,
                        totalEarning: finalWallet.totalEarning,
                    }}
                />
            </ComponentCard>
        </div>
    )
}

export default ProviderWallet