import Image from "next/image";
import Link from "next/link";

const articles = [
  {
    id: 1,
    title: "Beware of Fake Delivery Scams Spreading Online",
    date: "October 28, 2025",
    description:
      "Scammers are pretending to be delivery companies asking for small 're-delivery fees'. Learn how to identify these fake messages before you click.",
    image: "/img/fake-delivery.jpg",
    href: "#",
  },
  {
    id: 2,
    title: "New AI Voice Fraud Techniques Targeting Families",
    date: "October 30, 2025",
    description:
      "Fraudsters now use AI voice cloning to impersonate relatives in distress. Stay cautious when receiving urgent money transfer requests.",
    image: "/img/ai-voice-scam.jpg",
    href: "#",
  },
  {
    id: 3,
    title: "Top 5 Most Reported Scam Websites in 2025",
    date: "November 1, 2025",
    description:
      "Here are the latest scam domains reported by users. Check them out and avoid visiting these dangerous sites.",
    image: "/img/scam-sites.jpg",
    href: "#",
  },
];

export default function NewsPage() {
  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-trueGray-900">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-10">
          📰 Scam Awareness News
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          Stay informed with the latest updates on online scams, fraud prevention, and digital safety tips.
        </p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-trueGray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                className="object-cover w-full h-48"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-indigo-600 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-3">{post.date}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {post.description}
                </p>
                <Link
                  href={post.href}
                  className="text-indigo-500 hover:underline font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
