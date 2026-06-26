"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { categoryService } from "@/api/category/categoryService";

const flattenCategories = (categories, parentName = "-") =>
  categories.flatMap((category) => {
    const row = {
      id: category.id,
      name: category.name,
      depth: category.depth,
      parentName,
      childCount: category.children?.length ?? 0,
    };

    return [
      row,
      ...flattenCategories(category.children ?? [], category.name),
    ];
  });

export default function CategoryListPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const categories = await categoryService.getCategories();
      setRows(flattenCategories(Array.isArray(categories) ? categories : []));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리 목록 조회 중 오류가 발생했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "카테고리 명",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Button
            color="primary"
            size="small"
            sx={{ justifyContent: "flex-start", px: 0, fontWeight: 700 }}
            variant="text"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/categories/${params.row.id}`);
            }}
          >
            {params.value}
          </Button>
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
    [router],
  );

  const handleDelete = async () => {
    setErrorMessage("");
    setIsDeleting(true);

    try {
      await categoryService.deleteCategories(rowSelectionModel);
      setRowSelectionModel([]);
      await loadCategories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "카테고리 삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

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
            전시 카테고리 구조와 노출 상태를 관리합니다.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            color="error"
            disabled={rowSelectionModel.length === 0 || isDeleting || isLoading}
            startIcon={
              isDeleting ? (
                <CircularProgress color="inherit" size={16} />
              ) : (
                <DeleteIcon fontSize="small" />
              )
            }
            variant="outlined"
            onClick={handleDelete}
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
          rows={rows}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "grey.50",
            },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },
          }}
          onCellClick={(params) => {
            if (params.field === "name") {
              router.push(`/categories/${params.row.id}`);
            }
          }}
          onRowSelectionModelChange={(newSelectionModel) => {
            setRowSelectionModel(newSelectionModel);
          }}
        />
      </Paper>
    </Stack>
  );
}
