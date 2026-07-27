import Header from './components/Header.jsx';
import HeroSection from './components/Hero.jsx';
import BrandSlider from './components/BrandSlider.jsx';
import AboutUs from './components/AboutUs.jsx';
import Faq from './components/Faq.jsx';
import Feature from './components/Feature.jsx';
import Footer from './components/Footer.jsx';
import Team from './components/Team.jsx';
import Testimonials from './components/Testimonials.jsx';

export default function LandingPage() {
  return (
    <div className="relative" id="home">
      {/* hero */}
      <Header />
      <HeroSection />
      <BrandSlider />

      {/* about-us */}
      <AboutUs />

      {/* feature */}
      <Feature />

      {/* testimonial */}
      <Testimonials />

      {/* faq */}
      <Faq />

      {/* team */}
      <Team />

      {/* footer */}
      <Footer />
    </div>
  );
}
