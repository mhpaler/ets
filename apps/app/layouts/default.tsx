import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Layout({ children }) {
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
