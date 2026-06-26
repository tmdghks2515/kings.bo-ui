import { Stack } from "@mui/material";
import BackButton from "@/components/button/BackButton";

export default function ProductDetailLayout({ children }) {
  return (
    <Stack spacing={2.5}>
      <BackButton />
      {children}
    </Stack>
  );
}
