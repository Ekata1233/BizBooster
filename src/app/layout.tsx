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
import { ProviderProvider } from '@/context/ProviderContext';

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
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <UserProvider>
                <ModuleProvider>
                  <CategoryProvider>
                    <SubcategoryProvider>
                      <BannerProvider>
                        <ServiceProvider>
                          <ProviderProvider>
                    {children}
                    </ProviderProvider>
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
