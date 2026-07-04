"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { categoryService } from "@/api/category/categoryService";
import ChildCategoryEditor from "../_components/ChildCategoryEditor";

const categoryKeys = {
  all: ["categories"],
  detail: (categoryId) => ["categories", categoryId],
};

const collectCategoryIds = (category) => [
  category.id,
  ...(category.children ?? []).flatMap(collectCategoryIds),
];

const flattenCategories = (categories, excludedIds = new Set(), prefix = "") =>
  categories.flatMap((category) => {
    if (excludedIds.has(category.id)) {
      return [];
    }

    const label = prefix ? `${prefix} > ${category.name}` : category.name;
    const item = {
      id: category.id,
      depth: category.depth,
      label,
    };

    return [item, ...flattenCategories(category.children ?? [], excludedIds, label)];
  });

const toChildRows = (children = []) =>
  children.map((child) => ({
    id: child.id,
    name: child.name,
  }));

const toChildCommands = (children, depth) =>
  children
    .map((child) => ({
      ...child,
      name: child.name.trim(),
    }))
    .filter((child) => child.name)
    .map((child, index) => ({
      id: typeof child.id === "number" ? child.id : null,
      depth,
      name: child.name,
      sortOrder: index,
      parentCategoryId: null,
      children: [],
    }));

export default function CategoryDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { categoryId } = useParams();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [childCategories, setChildCategories] = useState([]);

  const categoryQuery = useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryService.getCategory(categoryId),
    enabled: Boolean(categoryId),
  });

  const parentCategoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (payload) => categoryService.updateCategory(categoryId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(categoryId),
        }),
      ]);
      router.push("/categories");
    },
  });

  const category = categoryQuery.data;

  const parentCategoryOptions = useMemo(() => {
    const categories = Array.isArray(parentCategoriesQuery.data) ? parentCategoriesQuery.data : [];
    const excludedIds = category ? new Set(collectCategoryIds(category)) : new Set();

    return flattenCategories(categories, excludedIds);
  }, [category, parentCategoriesQuery.data]);

  const initialChildRows = useMemo(() => toChildRows(category?.children ?? []), [category]);

  useEffect(() => {
    if (!category) {
      return;
    }

    setName(category.name ?? "");
    setSortOrder(category.sortOrder ?? 0);
    setParentCategoryId(category.parentCategoryId ?? "");
  }, [category]);

  const handleChildRowsChange = useCallback((rows) => {
    setChildCategories(rows);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateCategoryMutation.reset();

    const selectedParent = parentCategoryOptions.find(
      (option) => String(option.id) === String(parentCategoryId)
    );
    const depth = selectedParent ? selectedParent.depth + 1 : 0;

    updateCategoryMutation.mutate({
      id: Number(categoryId),
      depth,
      name: name.trim(),
      sortOrder: Number(sortOrder ?? 0),
      parentCategoryId: selectedParent ? selectedParent.id : null,
      children: toChildCommands(childCategories, depth + 1),
    });
  };

  const error = updateCategoryMutation.error ?? categoryQuery.error ?? parentCategoriesQuery.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "카테고리 처리 중 오류가 발생했습니다." : "";
  const isLoading = categoryQuery.isLoading || parentCategoriesQuery.isLoading;
  const isSubmitting = updateCategoryMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          카테고리 상세
        </Typography>
        <Typography color="text.secondary" variant="body2">
          카테고리 정보를 확인하고 수정합니다.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 3 }}>
        <Stack component="form" spacing={2.5} sx={{ maxWidth: 760 }} onSubmit={handleSubmit}>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField disabled label="카테고리 ID" value={categoryId ?? ""} />
          <TextField
            required
            disabled={isLoading || isSubmitting}
            label="카테고리 명"
            value={name}
            onChange={(event) => setName(event.target.value)}
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
          <FormControl>
            <InputLabel id="parent-category-label">상위 카테고리</InputLabel>
            <Select
              disabled={isLoading || isSubmitting}
              label="상위 카테고리"
              labelId="parent-category-label"
              value={parentCategoryId}
              onChange={(event) => setParentCategoryId(event.target.value)}
            >
              <MenuItem value="">없음</MenuItem>
              {parentCategoryOptions.map((categoryOption) => (
                <MenuItem key={categoryOption.id} value={categoryOption.id}>
                  {categoryOption.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            disabled
            label="Depth"
            value={
              parentCategoryId
                ? (parentCategoryOptions.find(
                    (option) => String(option.id) === String(parentCategoryId)
                  )?.depth ?? -1) + 1
                : 0
            }
          />

          <ChildCategoryEditor
            key={category?.id ?? "loading"}
            initialRows={initialChildRows}
            onRowsChange={handleChildRowsChange}
          />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push("/categories")}
            >
              목록
            </Button>
            <Button disabled={isLoading || isSubmitting} type="submit" variant="contained">
              {isSubmitting ? <CircularProgress color="inherit" size={20} /> : "저장"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
