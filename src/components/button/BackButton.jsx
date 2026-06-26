"use client";

import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

export default function BackButton({ children, onClick, ...props }) {
  const router = useRouter();

  return (
    <Button
      startIcon={<ArrowBackIcon fontSize="small" />}
      sx={{ alignSelf: "flex-start", ...props.sx }}
      variant={"text"}
      onClick={onClick ?? (() => router.back())}
      {...props}
    >
      {children}
    </Button>
  );
}
