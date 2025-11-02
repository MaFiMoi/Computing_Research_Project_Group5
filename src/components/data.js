import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/benefit-one.png";
import benefitTwoImg from "../../public/img/benefit-two.png";

const benefitOne = {
  title: "Highlight your benefi",
  desc: "You can use this space to highlight your first benefit or a feature of your product. It can also contain an image or Illustration like in the example along with some bullet points.",
  image: benefitOneImg,
  bullets: [
    {
      title: "Protect yourself from scams",
      desc: "Easily check if a phone number, email, or website is reported as a scam before you interact or share your personal information.",
      icon: <FaceSmileIcon />,
    },
    {
      title: "Report and share suspicious activity",
      desc: "Help protect the community by submitting scam reports. Your contribution builds a safer online space for everyone.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Stay updated with real-time data",
      desc: "Access regularly updated scam databases powered by trusted APIs and community feedback.",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "🔍 More reasons to use ScamShield",
  desc: "ScamShield helps you protect yourself and others with reliable, community-driven information. Check how our system enhances your online safety 👇.",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Real-time Scam Detection",
      desc: "Our database updates constantly through trusted APIs and verified user reports, ensuring you get accurate scam insights instantly.",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "Community-Powered Reports",
      desc: "Join a growing network of users who share and flag suspicious activities building a safer digital environment together.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Free & Privacy-Focused",
      desc: "ScamShield is a completely non-profit service. We never collect or sell your personal data your safety comes first. ",
      icon: <SunIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
