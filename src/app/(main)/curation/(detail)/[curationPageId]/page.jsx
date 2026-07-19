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
import { categoryService } from "@/api/category/categoryService";
import { displayService } from "@/api/display/displayService";
import { productService } from "@/api/product/productService";
import CurationDetailEditor, {
  CurationTypeSelect,
  createInitialDetailState,
  toCurationDetailPayload,
  toDetailState,
} from "../_components/CurationDetailEditor";

const displayKeys = {
  all: ["displays"],
  detail: (displayId) => ["displays", displayId],
};

export default function DisplayDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { displayId } = useParams();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [type, setType] = useState("MAIN_BANNER");
  const [detail, setDetail] = useState(() => createInitialDetailState("MAIN_BANNER"));

  const displayQuery = useQuery({
    queryKey: displayKeys.detail(displayId),
    queryFn: () => displayService.getDisplay(displayId),
    enabled: Boolean(displayId),
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

  const updateDisplayMutation = useMutation({
    mutationFn: (payload) => displayService.updateDisplay(displayId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: displayKeys.all }),
        queryClient.invalidateQueries({ queryKey: displayKeys.detail(displayId) }),
      ]);
      router.push("/display");
    },
  });

  useEffect(() => {
    if (!displayQuery.data) {
      return;
    }

    setName(displayQuery.data.name ?? "");
    setSortOrder(displayQuery.data.sortOrder ?? 0);
    setType(displayQuery.data.type ?? "MAIN_BANNER");
    setDetail(toDetailState(displayQuery.data.type, displayQuery.data.detail));
  }, [displayQuery.data]);

  const handleTypeChange = (nextType) => {
    setType(nextType);
    setDetail(createInitialDetailState(nextType));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateDisplayMutation.reset();

    updateDisplayMutation.mutate({
      curationPageType: displayQuery.data?.curationPageType ?? "MAIN",
      type,
      name: name.trim(),
      sortOrder: Number(sortOrder),
      detail: toCurationDetailPayload(type, detail),
    });
  };

  const error =
    updateDisplayMutation.error ??
    displayQuery.error ??
    productsQuery.error ??
    categoriesQuery.error ??
    brandsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "큐레이션 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = displayQuery.isLoading;
  const isSubmitting = updateDisplayMutation.isPending;
  const isLoadingOptions =
    productsQuery.isLoading || categoriesQuery.isLoading || brandsQuery.isLoading;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          큐레이션 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          큐레이션 기본 정보와 구성 항목을 수정합니다.
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

          <TextField disabled label="큐레이션 ID" value={displayId ?? ""} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              required
              disabled={isLoading || isSubmitting}
              fullWidth
              label="큐레이션 명"
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
              onClick={() => router.push("/display")}
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
