import ReportForm from "./components/ReportForm";
import ReportRanking from "./components/ReportRanking";
import ReportGuidelines from "./components/ReportGuidelines";

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-trueGray-900 py-10">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4">
        <ReportForm />
        <div>
          <ReportGuidelines />
          <ReportRanking />
        </div>
      </div>
    </div>
  );
}
