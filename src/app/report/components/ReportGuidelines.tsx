export default function ReportGuidelines() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-600 mb-4 uppercase">
        Reporting Guidelines
      </h2>

      <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg mb-4">
        <h3 className="font-semibold text-red-600 mb-1">⚠️ Notice</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Please avoid reporting adult or gambling websites — these are already
          classified as violating local laws. Our system focuses on scams
          targeting users’ data or money.
        </p>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-600 mb-1">
          ✅ Important Information
        </h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            Read our terms and verify the website’s legality before reporting.
          </li>
          <li>
            We use your reports to update scam databases and notify browser and
            cybersecurity partners (Google, Microsoft, etc.).
          </li>
          <li>
            If the site poses a real threat, it will be blocked across major
            browsers and DNS providers.
          </li>
          <li>
            If you believe a legitimate site was flagged incorrectly, please
            appeal via our contact form.
          </li>
        </ul>
      </div>
    </div>
  );
}
