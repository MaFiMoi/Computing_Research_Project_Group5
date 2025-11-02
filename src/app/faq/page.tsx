import { Container } from "@/components/Container";
import { Faq } from "@/components/Faq";
import { SectionTitle } from "@/components/SectionTitle";

export default function FAQPage() {
  return (
    <Container>
      <SectionTitle
        preTitle="FAQ"
        title="Frequently Asked Questions"
      >
        Find answers to common questions about ScamShield — how it works,
        how to report scams, and how your data is kept safe.
      </SectionTitle>

      <Faq />
    </Container>
  );
}
