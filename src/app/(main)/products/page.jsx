"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { brandService } from "@/api/brand/brandService";
import { categoryService } from "@/api/category/categoryService";
import { productService } from "@/api/product/productService";
import useConfirm from "@/hooks/useConfirm";

const productKeys = {
  all: ["products"],
  list: (filters) => [...productKeys.all, filters],
};

const brandKeys = {
  all: ["brands"],
};

const categoryKeys = {
  all: ["categories"],
};

const normalizeProducts = (response) => {
  const products = Array.isArray(response)
    ? response
    : Array.isArray(response?.content)
      ? response.content
      : Array.isArray(response?.items)
        ? response.items
        : [];

  return products.map((product) => ({
    ...product,
    id: product.id ?? product.code,
    categoryName: product.categoryName ?? product.category?.name ?? "-",
    brandName: product.brandName ?? product.brand?.name ?? "-",
    optionCount: product.optionCount ?? product.options?.length ?? 0,
  }));
};

const formatPrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const flattenCategories = (categories) =>
  (Array.isArray(categories) ? categories : []).flatMap((category) => [
    category,
    ...flattenCategories(category.children),
  ]);

const initialFilters = {
  keyword: "",
  categoryId: "",
  brandId: "",
};

const toProductParams = (filters) => ({
  keyword: filters.keyword.trim(),
  categoryId: filters.categoryId,
  brandId: filters.brandId,
});

export default function ProductListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const productsQuery = useQuery({
    queryKey: productKeys.list(appliedFilters),
    queryFn: () => productService.getProducts(toProductParams(appliedFilters)),
    select: normalizeProducts,
  });

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
    select: flattenCategories,
  });

  const brandsQuery = useQuery({
    queryKey: brandKeys.all,
    queryFn: () => brandService.getBrands(),
  });

  const deleteProductsMutation = useMutation({
    mutationFn: productService.deleteProducts,
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "code",
        headerName: "상품 코드",
        flex: 0.8,
        minWidth: 150,
        renderCell: (params) => (
          <Link color="primary" href={`/products/${params.row.code}`}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "name",
        headerName: "상품명",
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: "categoryName",
        headerName: "카테고리",
        flex: 0.8,
        minWidth: 160,
      },
      {
        field: "brandName",
        headerName: "브랜드",
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: "price",
        headerName: "판매가",
        align: "right",
        headerAlign: "right",
        minWidth: 130,
        valueFormatter: (value) => formatPrice(value),
      },
      {
        field: "optionCount",
        headerName: "옵션 수",
        align: "right",
        headerAlign: "right",
        width: 110,
      },
    ],
    [],
  );

  const handleDeleteClick = async () => {
    deleteProductsMutation.reset();

    const confirmed = await confirm({
      title: "상품 삭제",
      content: `선택한 상품 ${rowSelectionModel.length}개를 삭제하시겠습니까?`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteProductsMutation.mutate(rowSelectionModel);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setRowSelectionModel([]);
    setAppliedFilters({
      keyword: filters.keyword.trim(),
      categoryId: filters.categoryId,
      brandId: filters.brandId,
    });
  };

  const handleResetClick = () => {
    setRowSelectionModel([]);
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const error =
    deleteProductsMutation.error ??
    productsQuery.error ??
    categoriesQuery.error ??
    brandsQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "상품 처리 중 오류가 발생했습니다."
        : "";
  const isLoading = productsQuery.isLoading || productsQuery.isFetching;
  const isDeleting = deleteProductsMutation.isPending;
  const isFilterLoading = categoriesQuery.isLoading || brandsQuery.isLoading;
  const selectedCount = rowSelectionModel.length;

  return (
    <Stack spacing={2.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Box>
          <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
            상품 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            상품 목록과 기본 판매 정보를 관리합니다.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            color="error"
            disabled={selectedCount === 0 || isDeleting || isLoading}
            startIcon={
              isDeleting ? (
                <CircularProgress color="inherit" size={16} />
              ) : (
                <DeleteIcon fontSize="small" />
              )
            }
            variant="outlined"
            onClick={handleDeleteClick}
          >
            삭제
          </Button>
          <Button
            startIcon={<AddIcon fontSize="small" />}
            variant="contained"
            onClick={() => router.push("/products/new")}
          >
            생성
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
        <Stack
          component="form"
          alignItems={{ xs: "stretch", md: "center" }}
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          onSubmit={handleSearchSubmit}
        >
          <TextField
            label="상품코드 / 상품명"
            placeholder="상품코드 또는 상품명을 입력하세요"
            size="small"
            sx={{ flex: 1, minWidth: { md: 260 } }}
            value={filters.keyword}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                keyword: event.target.value,
              }));
            }}
          />
          <FormControl size="small" sx={{ minWidth: { md: 180 } }}>
            <InputLabel id="product-category-filter-label">카테고리</InputLabel>
            <Select
              label="카테고리"
              labelId="product-category-filter-label"
              value={filters.categoryId}
              onChange={(event) => {
                setFilters((current) => ({
                  ...current,
                  categoryId: event.target.value,
                }));
              }}
            >
              <MenuItem value="">전체</MenuItem>
              {(categoriesQuery.data ?? []).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { md: 180 } }}>
            <InputLabel id="product-brand-filter-label">브랜드</InputLabel>
            <Select
              label="브랜드"
              labelId="product-brand-filter-label"
              value={filters.brandId}
              onChange={(event) => {
                setFilters((current) => ({
                  ...current,
                  brandId: event.target.value,
                }));
              }}
            >
              <MenuItem value="">전체</MenuItem>
              {(brandsQuery.data ?? []).map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              disabled={isFilterLoading}
              type="submit"
              variant="contained"
            >
              검색
            </Button>
            <Button
              color="inherit"
              disabled={isFilterLoading}
              variant="outlined"
              onClick={handleResetClick}
            >
              초기화
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          height: 560,
          overflow: "hidden",
        }}
      >
        <DataGrid
          checkboxSelection
          disableRowSelectionOnClick
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50]}
          rowSelectionModel={rowSelectionModel}
          rows={productsQuery.data ?? []}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          onRowSelectionModelChange={(newSelectionModel) => {
            setRowSelectionModel(newSelectionModel);
          }}
        />
      </Paper>
    </Stack>
  );
}
