"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { categoryService } from "@/api/category/categoryService";
import { displayService } from "@/api/display/displayService";
import { productService } from "@/api/product/productService";
import CurationDetailEditor, {
  CurationTypeSelect,
  createInitialDetailState,
  toCurationDetailPayload,
} from "../_components/CurationDetailEditor";

const displayKeys = {
  all: ["displays"],
};

export default function DisplayCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState("MAIN_BANNER");
  const [detail, setDetail] = useState(() => createInitialDetailState("MAIN_BANNER"));

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getProducts(),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getBrands(),
  });

  const createDisplayMutation = useMutation({
    mutationFn: displayService.createDisplay,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: displayKeys.all });
      router.push("/display");
    },
  });

  useEffect(() => {
    setDetail(createInitialDetailState(type));
  }, [type]);

  const handleSubmit = (event) => {
    event.preventDefault();
    createDisplayMutation.reset();

    const formData = new FormData(event.currentTarget);

    createDisplayMutation.mutate({
      type,
      name: String(formData.get("name") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
      detail: toCurationDetailPayload(type, detail),
    });
  };

  const error =
    createDisplayMutation.error ??
    productsQuery.error ??
    categoriesQuery.error ??
    brandsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "전시 등록 중 오류가 발생했습니다."
        : "";
  const isSubmitting = createDisplayMutation.isPending;
  const isLoadingOptions =
    productsQuery.isLoading || categoriesQuery.isLoading || brandsQuery.isLoading;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          전시 생성
        </Typography>
        <Typography color="text.secondary" variant="body2">
          신규 전시 영역과 구성 항목을 입력합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ maxWidth: 960 }}
          onSubmit={handleSubmit}
        >
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              required
              disabled={isSubmitting}
              fullWidth
              label="전시 명"
              name="name"
              placeholder="전시 명을 입력하세요"
            />
            <TextField
              required
              disabled={isSubmitting}
              fullWidth
              inputProps={{ min: 0 }}
              label="노출 순서"
              name="sortOrder"
              type="number"
              defaultValue={0}
            />
          </Stack>

          <CurationTypeSelect
            disabled={isSubmitting}
            value={type}
            onChange={setType}
          />

          <CurationDetailEditor
            brands={brandsQuery.data ?? []}
            categories={categoriesQuery.data ?? []}
            disabled={isSubmitting || isLoadingOptions}
            products={productsQuery.data ?? []}
            type={type}
            value={detail}
            onChange={setDetail}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push("/display")}
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
