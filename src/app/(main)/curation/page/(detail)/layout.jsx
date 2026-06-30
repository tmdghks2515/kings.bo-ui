import { Stack } from "@mui/material";
import BackButton from "@/components/button/BackButton";

export default function CurationPageDetailLayout({ children }) {
  return (
    <Stack spacing={2.5}>
      <BackButton />
      {children}
    </Stack>
  );
}
