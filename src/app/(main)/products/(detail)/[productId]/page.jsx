"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { categoryService } from "@/api/category/categoryService";
import { productService } from "@/api/product/productService";
import CategorySelect from "@/app/(main)/products/(detail)/_components/CategorySelect";
import ProductImageEditor from "@/app/(main)/products/(detail)/_components/ProductImageEditor";
import ProductOptionEditor from "@/app/(main)/products/(detail)/_components/ProductOptionEditor";

const productKeys = {
  all: ["products"],
  detail: (productId) => ["products", productId],
};

const categoryKeys = {
  all: ["categories"],
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return Number(value);
};

const toOptionRows = (options = []) =>
  options.map((option, index) => ({
    id: `${option.name}-${index}`,
    name: option.name ?? "",
    price: option.price ?? "",
    type: option.type ?? "ETC",
  }));

const toImageRows = (images = []) =>
  images.map((image) => ({
    fileResourceId: image.fileResourceId,
    originalName: image.originalName,
    storageKey: image.storageKey,
    contentType: image.contentType,
    extension: image.extension,
    sizeBytes: image.sizeBytes,
    main: image.main,
  }));

const toDetailImageRows = (images = []) =>
  images.map((image) => ({
    fileResourceId: image.fileResourceId,
    originalName: image.originalName,
    storageKey: image.storageKey,
    contentType: image.contentType,
    extension: image.extension,
    sizeBytes: image.sizeBytes,
  }));

const toOptionPayload = (options) =>
  options
    .map((option) => ({
      name: option.name.trim(),
      price: toNumberOrNull(option.price),
      type: option.type,
    }))
    .filter((option) => option.name);

const toImagePayload = (images) =>
  images.map((image) => ({
    fileResourceId: image.fileResourceId,
    main: Boolean(image.main),
  }));

const toDetailImagePayload = (images) =>
  images.map((image) => image.fileResourceId);

export default function ProductDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { productId } = useParams();
  const [activeTab, setActiveTab] = useState("basic");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [options, setOptions] = useState([]);
  const [images, setImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);

  const productQuery = useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => productService.getProduct(productId),
    enabled: Boolean(productId),
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
  });

  const updateProductMutation = useMutation({
    mutationFn: (payload) => productService.updateProduct(productId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(productId),
        }),
      ]);
      router.push("/products");
    },
  });

  const initialOptionRows = useMemo(
    () => toOptionRows(productQuery.data?.options ?? []),
    [productQuery.data],
  );

  useEffect(() => {
    if (!productQuery.data) {
      return;
    }

    setName(productQuery.data.name ?? "");
    setPrice(productQuery.data.price ?? "");
    setCategoryId(productQuery.data.categoryId ?? "");
    setImages(toImageRows(productQuery.data.images ?? []));
    setDetailImages(toDetailImageRows(productQuery.data.detailImages ?? []));
  }, [productQuery.data]);

  const handleOptionRowsChange = useCallback((rows) => {
    setOptions(rows);
  }, []);

  const buildPayload = () => ({
    code: productId,
    name: name.trim(),
    price: toNumberOrNull(price),
    categoryId: toNumberOrNull(categoryId),
    options: toOptionPayload(options),
    images: toImagePayload(images),
    detailImages: toDetailImagePayload(detailImages),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    updateProductMutation.reset();
    updateProductMutation.mutate(buildPayload());
  };

  const handleImageSave = () => {
    updateProductMutation.reset();
    updateProductMutation.mutate(buildPayload());
  };

  const error =
    updateProductMutation.error ?? productQuery.error ?? categoriesQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "상품 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = productQuery.isLoading;
  const isLoadingCategories = categoriesQuery.isLoading;
  const isSubmitting = updateProductMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          상품 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          상품의 기본 정보, 옵션, 이미지를 수정합니다.
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          onChange={(_, value) => setActiveTab(value)}
        >
          <Tab label="기본정보" value="basic" />
          <Tab label="이미지" value="images" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === "basic" ? (
            <Stack
              component="form"
              spacing={2.5}
              sx={{ maxWidth: 900 }}
              onSubmit={handleSubmit}
            >
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  disabled
                  fullWidth
                  label="상품 코드"
                  value={productId ?? ""}
                />
                <TextField
                  required
                  disabled={isLoading || isSubmitting}
                  fullWidth
                  label="상품명"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  disabled={isLoading || isSubmitting}
                  fullWidth
                  inputProps={{ min: 0 }}
                  label="판매가"
                  placeholder="0"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
                <CategorySelect
                  categories={categoriesQuery.data ?? []}
                  disabled={isLoading || isSubmitting || isLoadingCategories}
                  value={categoryId}
                  onChange={setCategoryId}
                />
              </Stack>

              <ProductOptionEditor
                disabled={isLoading || isSubmitting}
                initialRows={initialOptionRows}
                onRowsChange={handleOptionRowsChange}
              />

              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  color="inherit"
                  disabled={isSubmitting}
                  onClick={() => router.push("/products")}
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
          ) : (
            <Stack spacing={2.5}>
              <ProductImageEditor
                detailImages={detailImages}
                disabled={isLoading || isSubmitting}
                images={images}
                onDetailImagesChange={setDetailImages}
                onImagesChange={setImages}
              />

              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button
                  color="inherit"
                  disabled={isSubmitting}
                  onClick={() => router.push("/products")}
                >
                  목록
                </Button>
                <Button
                  disabled={isLoading || isSubmitting}
                  variant="contained"
                  onClick={handleImageSave}
                >
                  {isSubmitting ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : (
                    "저장"
                  )}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Paper>
    </Stack>
  );
}
