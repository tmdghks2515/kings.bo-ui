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
  toDetailState,
} from "./CurationDetailEditor";

const curationKeys = {
  all: ["displays"],
  detail: (curationId) => ["curations", curationId],
  pageDetail: (curationPageId) => ["curation-pages", curationPageId],
};

export default function CurationForm({ curationId, curationPageId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const returnPath = curationPageId
    ? `/curation/page/${curationPageId}`
    : "/curation/page";
  const isEdit = Boolean(curationId);
  const [type, setType] = useState("MAIN_BANNER");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [detail, setDetail] = useState(() =>
    createInitialDetailState("MAIN_BANNER"),
  );

  const curationQuery = useQuery({
    queryKey: curationKeys.detail(curationId),
    queryFn: () => displayService.getDisplay(curationId),
    enabled: isEdit,
  });

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

  const saveCurationMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? displayService.updateDisplay(curationId, payload)
        : displayService.createDisplay(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: curationKeys.all }),
        isEdit
          ? queryClient.invalidateQueries({
              queryKey: curationKeys.detail(curationId),
            })
          : Promise.resolve(),
        curationPageId
          ? queryClient.invalidateQueries({
              queryKey: curationKeys.pageDetail(curationPageId),
            })
          : Promise.resolve(),
      ]);
      router.push(returnPath);
    },
  });

  useEffect(() => {
    if (!curationQuery.data) {
      return;
    }

    const nextType = curationQuery.data.type ?? "MAIN_BANNER";
    setType(nextType);
    setName(curationQuery.data.name ?? "");
    setSortOrder(curationQuery.data.sortOrder ?? 0);
    setDetail(toDetailState(nextType, curationQuery.data.detail));
  }, [curationQuery.data]);

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setDetail(createInitialDetailState(nextType));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveCurationMutation.reset();

    saveCurationMutation.mutate({
      curationPageType: curationQuery.data?.curationPageType ?? "MAIN",
      type,
      name: name.trim(),
      sortOrder: Number(sortOrder ?? 0),
      detail: toCurationDetailPayload(type, detail),
    });
  };

  const error =
    saveCurationMutation.error ??
    curationQuery.error ??
    productsQuery.error ??
    categoriesQuery.error ??
    brandsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "큐레이션 처리 중 오류가 발생했습니다."
        : "";
  const isSubmitting = saveCurationMutation.isPending;
  const isLoading = curationQuery.isLoading;
  const isLoadingOptions =
    productsQuery.isLoading || categoriesQuery.isLoading || brandsQuery.isLoading;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          {isEdit ? "큐레이션 상세" : "큐레이션 생성"}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {isEdit
            ? "큐레이션 영역과 구성 항목을 수정합니다."
            : "신규 큐레이션 영역과 구성 항목을 입력합니다."}
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
              disabled={isLoading || isSubmitting}
              fullWidth
              label="큐레이션 명"
              placeholder="큐레이션 명을 입력하세요"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              required
              disabled={isLoading || isSubmitting}
              fullWidth
              inputProps={{ min: 0 }}
              label="노출 순서"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </Stack>

          <CurationTypeSelect
            disabled={isLoading || isSubmitting}
            value={type}
            onChange={handleTypeChange}
          />

          <CurationDetailEditor
            brands={brandsQuery.data ?? []}
            categories={categoriesQuery.data ?? []}
            disabled={isLoading || isSubmitting || isLoadingOptions}
            products={productsQuery.data ?? []}
            type={type}
            value={detail}
            onChange={setDetail}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push(returnPath)}
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
