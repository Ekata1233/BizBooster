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
    if (error) return <p>Error: {error}</p>;
    if (!wallet) return <p>No wallet found.</p>;

    console.log("wallet : ", wallet)
    return (
        <div className="">
            <ComponentCard title="Wallet ">
                <WalletStats
                    wallet={{
                        receivableBalance: wallet.receivableBalance,
                        cashInHand: wallet.cashInHand,
                        withdrawableBalance: wallet.balance,
                        pendingWithdraw: wallet.balance,
                        alreadyWithdrawn: wallet.alreadyWithdrawn,
                        totalEarning: wallet.totalEarning,
                    }}
                />
            </ComponentCard>
        </div>
    )
}

export default ProviderWallet