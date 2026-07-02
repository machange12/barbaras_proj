import { ArchiveSection } from '../../sections/landing/ArchiveSection';
import { ApplicationSection } from '../../sections/landing/ApplicationSection';
import { BookshelfSection } from '../../sections/landing/BookshelfSection';
import { DebatesSection } from '../../sections/landing/DebatesSection';
import { EssaysSection } from '../../sections/landing/EssaysSection';
import { EventsSection } from '../../sections/landing/EventsSection';
import { HeroSection } from '../../sections/landing/HeroSection';
import { HistorySection } from '../../sections/landing/HistorySection';
import { NewsletterSection } from '../../sections/landing/NewsletterSection';
import { WhatsAppSection } from '../../sections/landing/WhatsAppSection';
import { SiteFooter } from '../../components/layout/SiteFooter';

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <HistorySection />
      <BookshelfSection />
      <ArchiveSection />
      <DebatesSection />
      <EssaysSection />
      <EventsSection />
      <NewsletterSection />
      <WhatsAppSection />
      <ApplicationSection />
      <SiteFooter />
    </main>
  );
}
