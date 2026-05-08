import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/Layout";
import { useDocumentMeta } from "../lib/useDocumentMeta";

export function OurStoryPage() {
  const navigate = useNavigate();
  useDocumentMeta({
    title: "Our Story · VeilChat",
    description: "The story behind VeilChat — why we built it, what we believe, and where we're going.",
    canonical: "/our-story",
    ogType: "article",
  });

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <AppBar title="Our Story" back={() => navigate(-1)} />
      <div className="flex-1 bg-panel pb-16 w-full mx-auto lg:max-w-2xl lg:my-4 lg:rounded-2xl lg:border lg:border-line/60 lg:shadow-card lg:overflow-hidden">
        {/* Content coming soon */}
      </div>
    </div>
  );
}
