'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Don't show footer on landing page (root path)
  const shouldHideFooter = pathname === '/';
  
  if (shouldHideFooter) {
    return null;
  }
  
  return <Footer />;
}