"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
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
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { categoryService } from "@/api/category/categoryService";
import useConfirm from "@/hooks/useConfirm";

const categoryKeys = {
  all: ["categories"],
};

const flattenCategories = (categories, parentName = "-") =>
  categories.flatMap((category) => {
    const row = {
      id: category.id,
      name: category.name,
      depth: category.depth,
      parentName,
      childCount: category.children?.length ?? 0,
    };

    return [row, ...flattenCategories(category.children ?? [], category.name)];
  });

export default function CategoryListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoryService.getCategories(),
    select: (categories) => flattenCategories(Array.isArray(categories) ? categories : []),
  });

  const deleteCategoriesMutation = useMutation({
    mutationFn: categoryService.deleteCategories,
    onSuccess: async () => {
      setRowSelectionModel([]);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "카테고리 명",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Link
            color="primary"
            component={NextLink}
            href={`/categories/edit?categoryId=${params.row.id}`}
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "depth",
        headerName: "Depth",
        align: "center",
        headerAlign: "center",
        width: 90,
      },
      {
        field: "parentName",
        headerName: "상위 카테고리",
        flex: 0.8,
        minWidth: 140,
      },
      {
        field: "childCount",
        headerName: "하위 카테고리 수",
        align: "right",
        headerAlign: "right",
        width: 150,
      },
    ],
    []
  );

  const handleDeleteClick = async () => {
    deleteCategoriesMutation.reset();

    const confirmed = await confirm({
      title: "카테고리 삭제",
      content: `선택한 카테고리 ${rowSelectionModel.length}개를 삭제하시겠습니까? 하위 카테고리가 함께 삭제될 수 있습니다.`,
      confirmText: "삭제",
      icon: <DeleteIcon color="error" fontSize="small" />,
      variant: "danger",
    });

    if (confirmed) {
      deleteCategoriesMutation.mutate(rowSelectionModel);
    }
  };

  const error = deleteCategoriesMutation.error ?? categoriesQuery.error;
  const errorMessage =
    error instanceof Error ? error.message : error ? "카테고리 처리 중 오류가 발생했습니다." : "";
  const isLoading = categoriesQuery.isLoading || categoriesQuery.isFetching;
  const isDeleting = deleteCategoriesMutation.isPending;
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
            카테고리 관리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            큐레이션 카테고리 구조를 관리합니다.
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
            onClick={() => router.push("/categories/new")}
          >
            생성
          </Button>
        </Stack>
      </Stack>

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
          rows={categoriesQuery.data ?? []}
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
