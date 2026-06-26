"use client";

import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button } from "@mui/material";

export default function BackButton({ children = "뒤로가기", onClick, ...props }) {
  const router = useRouter();

  return (
    <Button
      color="inherit"
      startIcon={<ArrowBackIcon fontSize="small" />}
      sx={{ alignSelf: "flex-start", ...props.sx }}
      variant="outlined"
      onClick={onClick ?? (() => router.back())}
      {...props}
    >
      {children}
    </Button>
  );
}
