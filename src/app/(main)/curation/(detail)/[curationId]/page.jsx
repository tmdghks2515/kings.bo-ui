"use client";

import { useParams, useSearchParams } from "next/navigation";
import CurationForm from "../_components/CurationForm";

export default function CurationDetailPage() {
  const { curationId } = useParams();
  const searchParams = useSearchParams();
  const curationPageId = searchParams.get("curationPageId");

  return (
    <CurationForm curationId={curationId} curationPageId={curationPageId} />
  );
}
