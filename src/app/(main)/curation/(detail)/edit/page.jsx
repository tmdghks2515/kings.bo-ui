"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CurationForm from "../_components/CurationForm";

function CurationDetailContent() {
  const searchParams = useSearchParams();
  const curationId = searchParams.get("curationId");
  const curationPageId = searchParams.get("curationPageId");

  return <CurationForm curationId={curationId} curationPageId={curationPageId} />;
}

export default function CurationDetailPage() {
  return (
    <Suspense fallback={null}>
      <CurationDetailContent />
    </Suspense>
  );
}
