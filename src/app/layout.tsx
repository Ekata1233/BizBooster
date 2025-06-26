import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { ModuleProvider } from '@/context/ModuleContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { SubcategoryProvider } from '@/context/SubcategoryContext';
import { BannerProvider } from '@/context/BannerContext';
import { ServiceProvider } from '@/context/ServiceContext';
import { ProviderContextProvider } from '@/context/ProviderContext';
import { WhyChooseProvider } from '@/context/WhyChooseContext';
import { ZoneProvider } from '@/context/ZoneContext';
import RouteLoader from '@/components/RouteLoader';
import { SubscribeProvider } from '@/context/SubscribeContext';
import { CouponProvider } from '@/context/CouponContext';
import { ServiceCustomerProvider } from '@/context/ServiceCustomerContext';
import { CheckoutProvider } from '@/context/CheckoutContext';
import { LeadProvider } from '@/context/LeadContext';
import { ServiceManProvider } from '@/context/ServiceManContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <RouteLoader />
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <UserProvider>
                <ModuleProvider>
                  <CategoryProvider>
                    <SubcategoryProvider>
                      <BannerProvider>
                        <ServiceProvider>
                          <ProviderContextProvider>
                            <WhyChooseProvider>
                              <ZoneProvider>
                                <SubscribeProvider>
                                  <CouponProvider>
                                    <ServiceCustomerProvider>
                                      <CheckoutProvider>
                                        <LeadProvider>
                                          <ServiceManProvider>
                                            {children}
                                          </ServiceManProvider>
                                        </LeadProvider>
                                      </CheckoutProvider>
                                    </ServiceCustomerProvider>
                                  </CouponProvider>
                                </SubscribeProvider>
                              </ZoneProvider>
                            </WhyChooseProvider>
                          </ProviderContextProvider>
                        </ServiceProvider>
                      </BannerProvider>
                    </SubcategoryProvider>
                  </CategoryProvider>
                </ModuleProvider>
              </UserProvider>
            </AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
