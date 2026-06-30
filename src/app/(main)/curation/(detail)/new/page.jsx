"use client";

import { useSearchParams } from "next/navigation";
import CurationForm from "../_components/CurationForm";

export default function CurationCreatePage() {
  const searchParams = useSearchParams();
  const curationPageId = searchParams.get("curationPageId");

  return <CurationForm curationPageId={curationPageId} />;
}
