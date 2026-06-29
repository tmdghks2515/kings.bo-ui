"use client";

import { useCallback, useState } from "react";
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
import { productService } from "@/api/product/productService";
import BrandSelect from "@/app/(main)/products/(detail)/_components/BrandSelect";
import CategorySelect from "@/app/(main)/products/(detail)/_components/CategorySelect";
import ProductOptionEditor from "@/app/(main)/products/(detail)/_components/ProductOptionEditor";

const productKeys = {
  all: ["products"],
};

const categoryKeys = {
  all: ["categories"],
};

const brandKeys = {
  all: ["brands"],
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return Number(value);
};

const toOptionPayload = (options) =>
  options
    .map((option) => ({
      name: option.name.trim(),
      price: toNumberOrNull(option.price),
      type: option.type,
    }))
    .filter((option) => option.name);

export default function ProductCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [options, setOptions] = useState([]);

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
  });

  const brandsQuery = useQuery({
    queryKey: brandKeys.all,
    queryFn: () => brandService.getBrands(),
  });

  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
      router.push("/products");
    },
  });

  const handleOptionRowsChange = useCallback((rows) => {
    setOptions(rows);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    createProductMutation.reset();

    const formData = new FormData(event.currentTarget);

    createProductMutation.mutate({
      code: String(formData.get("code") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      price: toNumberOrNull(formData.get("price")),
      categoryId: toNumberOrNull(categoryId),
      brandId: toNumberOrNull(brandId),
      options: toOptionPayload(options),
    });
  };

  const error =
    createProductMutation.error ?? categoriesQuery.error ?? brandsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "상품 등록 중 오류가 발생했습니다."
        : "";
  const isSubmitting = createProductMutation.isPending;
  const isLoadingCategories = categoriesQuery.isLoading;
  const isLoadingBrands = brandsQuery.isLoading;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          상품 생성
        </Typography>
        <Typography color="text.secondary" variant="body2">
          신규 상품의 기본 정보와 옵션을 입력합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ maxWidth: 900 }}
          onSubmit={handleSubmit}
        >
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              required
              disabled={isSubmitting}
              fullWidth
              label="상품 코드"
              name="code"
              placeholder="예: P000001"
            />
            <TextField
              required
              disabled={isSubmitting}
              fullWidth
              label="상품명"
              name="name"
              placeholder="상품명을 입력하세요"
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              disabled={isSubmitting}
              fullWidth
              inputProps={{ min: 0 }}
              label="판매가"
              name="price"
              placeholder="0"
              type="number"
            />
            <CategorySelect
              categories={categoriesQuery.data ?? []}
              disabled={isSubmitting || isLoadingCategories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </Stack>

          <BrandSelect
            brands={brandsQuery.data ?? []}
            disabled={isSubmitting || isLoadingBrands}
            value={brandId}
            onChange={setBrandId}
          />

          <ProductOptionEditor
            disabled={isSubmitting}
            onRowsChange={handleOptionRowsChange}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push("/products")}
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
