"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
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
};

const flattenCategories = (categories, prefix = "") =>
  categories.flatMap((category) => {
    const label = prefix ? `${prefix} > ${category.name}` : category.name;
    const item = {
      id: category.id,
      depth: category.depth,
      label,
    };

    return [
      item,
      ...flattenCategories(category.children ?? [], label),
    ];
  });

export default function CategoryCreatePage() {
  const router = useRouter();
  const [childCategories, setChildCategories] = useState([]);

  const parentCategoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
    select: (categories) =>
      flattenCategories(Array.isArray(categories) ? categories : []),
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      router.push("/categories");
    },
  });

  const parentCategoryOptions = useMemo(
    () => parentCategoriesQuery.data ?? [],
    [parentCategoriesQuery.data],
  );

  const handleChildRowsChange = useCallback((rows) => {
    setChildCategories(rows);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    createCategoryMutation.reset();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const parentCategoryIdValue = String(formData.get("parentCategoryId") ?? "");
    const parentCategory = parentCategoryOptions.find(
      (option) => String(option.id) === parentCategoryIdValue,
    );
    const depth = parentCategory ? parentCategory.depth + 1 : 0;
    const parentCategoryId = parentCategory ? parentCategory.id : null;
    const children = childCategories
      .map((child) => ({
        ...child,
        name: child.name.trim(),
      }))
      .filter((child) => child.name)
      .map((child) => ({
        id: null,
        depth: depth + 1,
        name: child.name,
        parentCategoryId: null,
        children: [],
      }));

    createCategoryMutation.mutate({
      id: null,
      depth,
      name,
      parentCategoryId,
      children,
    });
  };

  const error = createCategoryMutation.error ?? parentCategoriesQuery.error;
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? "카테고리 처리 중 오류가 발생했습니다."
        : "";
  const isLoadingParents = parentCategoriesQuery.isLoading;
  const isSubmitting = createCategoryMutation.isPending;

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 800 }}>
          카테고리 생성
        </Typography>
        <Typography color="text.secondary" variant="body2">
          신규 카테고리의 기본 정보를 입력합니다.
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
            label="카테고리 명"
            name="name"
            placeholder="카테고리 명을 입력하세요"
          />
          <FormControl>
            <InputLabel id="parent-category-label">상위 카테고리</InputLabel>
            <Select
              defaultValue=""
              disabled={isSubmitting || isLoadingParents}
              label="상위 카테고리"
              labelId="parent-category-label"
              name="parentCategoryId"
            >
              <MenuItem value="">없음</MenuItem>
              {parentCategoryOptions.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            defaultValue={1}
            inputProps={{ min: 1 }}
            label="노출 순서"
            type="number"
          />
          <FormControl>
            <InputLabel id="category-status-label">상태</InputLabel>
            <Select
              defaultValue="use"
              disabled={isSubmitting}
              label="상태"
              labelId="category-status-label"
            >
              <MenuItem value="use">사용</MenuItem>
              <MenuItem value="unused">미사용</MenuItem>
            </Select>
          </FormControl>

          <ChildCategoryEditor onRowsChange={handleChildRowsChange} />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              color="inherit"
              disabled={isSubmitting}
              onClick={() => router.push("/categories")}
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
