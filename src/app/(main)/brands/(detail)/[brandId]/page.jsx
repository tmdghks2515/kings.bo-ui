"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  detail: (brandId) => ["brands", brandId],
};

const toImage = (fileResource, storageKey) => {
  if (typeof fileResource === "string") {
    return { storageKey: fileResource, originalName: fileResource };
  }

  if (fileResource) {
    return fileResource;
  }

  return storageKey ? { storageKey, originalName: storageKey } : null;
};

export default function BrandDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { brandId } = useParams();
  const [name, setName] = useState("");
  const [introduce, setIntroduce] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [logo, setLogo] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const brandQuery = useQuery({
    queryKey: brandKeys.detail(brandId),
    queryFn: () => brandService.getBrand(brandId),
    enabled: Boolean(brandId),
  });

  const updateBrandMutation = useMutation({
    mutationFn: (payload) => brandService.updateBrand(brandId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: brandKeys.all }),
        queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) }),
      ]);
      router.push("/brands");
    },
  });

  useEffect(() => {
    if (!brandQuery.data) {
      return;
    }

    setName(brandQuery.data.name ?? "");
    setIntroduce(brandQuery.data.introduce ?? "");
    setSortOrder(brandQuery.data.sortOrder ?? 0);
    setLogo(toImage(brandQuery.data.logo, brandQuery.data.logoStorageKey));
    setMainImage(
      toImage(brandQuery.data.mainImage, brandQuery.data.mainImageStorageKey),
    );
  }, [brandQuery.data]);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateBrandMutation.reset();

    updateBrandMutation.mutate({
      name: name.trim(),
      introduce: introduce.trim() || null,
      sortOrder: Number(sortOrder ?? 0),
      logoStorageKey: logo?.storageKey ?? null,
      mainImageStorageKey: mainImage?.storageKey ?? null,
    });
  };

  const error = updateBrandMutation.error ?? brandQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "브랜드 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = brandQuery.isLoading;
  const isSubmitting = updateBrandMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          브랜드 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          브랜드 정보를 확인하고 수정합니다.
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

          <TextField disabled label="브랜드 ID" value={brandId ?? ""} />
          <TextField
            required
            disabled={isLoading || isSubmitting}
            label="브랜드 명"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            multiline
            disabled={isLoading || isSubmitting}
            inputProps={{ maxLength: 1000 }}
            label="브랜드 소개"
            minRows={5}
            value={introduce}
            onChange={(event) => setIntroduce(event.target.value)}
          />
          <TextField
            required
            disabled={isLoading || isSubmitting}
            inputProps={{ min: 0 }}
            label="노출 순서"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />

          <BrandImageInput
            description="브랜드 로고 이미지를 등록합니다."
            disabled={isLoading || isSubmitting}
            image={logo}
            title="로고"
            onChange={setLogo}
          />

          <BrandImageInput
            description="브랜드 영역에 노출할 대표 이미지를 등록합니다."
            disabled={isLoading || isSubmitting}
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
              목록
            </Button>
            <Button
              disabled={isLoading || isSubmitting}
              type="submit"
              variant="contained"
            >
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
