import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }: {children: ReactNode}) {
  return (
    <div className="antialiased bg-white">
      <Navbar />
      <main className="px-4">
        {children}
      </main>
      <Footer />
    </div>
  )
}
