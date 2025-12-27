import { useState } from "react";
import NavigationBar from "../../../components/NavigationBar";

const reasons = [
  "Select reason",
  "Spam or misleading",
  "Harmful or dangerous content",
  "Harassment or bullying",
  "Hate speech",
  "Copyright infringement",
  "Privacy violation",
  "Inappropriate content",
  "Other"
];

const ReportPage = () => {
  const [reason, setReason] = useState("Select reason");
  const [description, setDescription] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Report Content</h1>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-2">
                Reason for Report
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {reasons.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide additional details about your report..."
                rows={5}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <button className="w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Submit Report
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            False reports may result in action against your account
          </p>
        </div>
      </main>
    </div>
  );
};

export default ReportPage;
