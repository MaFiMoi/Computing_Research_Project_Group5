import { articlesData } from "../page";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; // 👈 thêm dòng này

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articlesData.find((a) => a.slug === params.slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">
          ❌ Không tìm thấy bài viết
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-14 bg-gray-50 dark:bg-trueGray-900">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* 🔙 Nút quay lại */}
        <Link
          href="/news"
          className="text-indigo-500 hover:underline mb-5 inline-block"
        >
          ← Quay lại trang tin
        </Link>

        {/* 🖼️ Ảnh minh họa */}
        <Image
          src={article.image}
          alt={article.title}
          width={800}
          height={500}
          className="rounded-2xl shadow-md mb-5"
        />

        {/* 📰 Tiêu đề & ngày đăng */}
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          {article.title}
        </h1>
        <p className="text-gray-500 mb-5 text-sm">{article.date}</p>

        {/* 📄 Hiển thị nội dung Markdown */}
        <div className="prose dark:prose-invert max-w-none text-[17px] leading-[1.65] prose-h2:text-indigo-600 prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-strong:text-gray-800 dark:prose-strong:text-gray-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]} // 👈 Cho phép render HTML nội tuyến
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
