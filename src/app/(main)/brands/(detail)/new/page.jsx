"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { brandService } from "@/api/brand/brandService";
import BrandImageInput from "../_components/BrandImageInput";

const brandKeys = {
  all: ["brands"],
};

export default function BrandCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [logo, setLogo] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const createBrandMutation = useMutation({
    mutationFn: brandService.createBrand,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: brandKeys.all });
      router.push("/brands");
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    createBrandMutation.reset();

    const formData = new FormData(event.currentTarget);
    const introduce = String(formData.get("introduce") ?? "").trim();

    createBrandMutation.mutate({
      name: String(formData.get("name") ?? "").trim(),
      introduce: introduce || null,
      logoResourceId: logo?.id ?? null,
      mainImageResourceId: mainImage?.id ?? null,
    });
  };

  const error = createBrandMutation.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "브랜드 등록 중 오류가 발생했습니다."
        : "";
  const isSubmitting = createBrandMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          브랜드 생성
        </Typography>
        <Typography color="text.secondary" variant="body2">
          신규 브랜드의 기본 정보와 대표 이미지를 입력합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ maxWidth: 760 }}
          onSubmit={handleSubmit}
        >
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            required
            disabled={isSubmitting}
            label="브랜드 명"
            name="name"
            placeholder="브랜드 명을 입력하세요"
          />
          <TextField
            multiline
            disabled={isSubmitting}
            inputProps={{ maxLength: 1000 }}
            label="브랜드 소개"
            minRows={5}
            name="introduce"
            placeholder="브랜드 소개를 입력하세요"
          />

          <BrandImageInput
            description="브랜드 로고 이미지를 등록합니다."
            disabled={isSubmitting}
            image={logo}
            title="로고"
            onChange={setLogo}
          />

          <BrandImageInput
            description="브랜드 영역에 노출할 대표 이미지를 등록합니다."
            disabled={isSubmitting}
            image={mainImage}
            title="대표 이미지"
            onChange={setMainImage}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push("/brands")}
            >
              취소
            </Button>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {isSubmitting ? (
                <CircularProgress color="inherit" size={20} />
              ) : (
                "저장"
              )}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
