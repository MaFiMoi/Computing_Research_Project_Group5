import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Benefits } from "@/components/Benefits";
import { Video } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";

import { benefitOne, benefitTwo } from "@/components/data";
export default function Home() {
  return (
    <Container>
      <Hero />
      <SectionTitle
        preTitle="Benefits"
        title=" Quick check, instant alert Content"
      >
        Just enter the phone number or paste the website link into the search box. 
        Our system will analyze and compare it with the database and fraud reports and immediately warn if a risk is detected.
      </SectionTitle>

      <Benefits data={benefitOne} />
      <Benefits imgPos="right" data={benefitTwo} />

      <SectionTitle
        preTitle="Watch a video"
        title="Learn how to stay safe online"
      >
        Cyber scams are becoming more sophisticated every day. Watch this awareness video to learn how to identify, avoid, and report online fraud because your safety matters.
      </SectionTitle>

      <Video videoId="fZ0D0cnR88E" />

      <SectionTitle
        preTitle="💬 USER STORIES"
        title="Here's what our users have to say"
      >
        ScamShield has helped dozens of users stay alert and avoid scams every day.
        Here&apos; what some of our users have to say 👇
      </SectionTitle>

      <Testimonials />

      <Cta />
    </Container>
  );
}
