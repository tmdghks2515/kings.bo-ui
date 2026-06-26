"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ChildCategoryEditor from "../_components/ChildCategoryEditor";

const categoryMap = {
  1: {
    name: "신상품",
    parent: "",
    order: 1,
    status: "use",
    children: [
      { id: "1-1", name: "오늘의 신상품", displayOrder: 1, status: "use" },
      { id: "1-2", name: "이번 주 신상품", displayOrder: 2, status: "use" },
    ],
  },
  2: {
    name: "베스트",
    parent: "",
    order: 2,
    status: "use",
    children: [
      { id: "2-1", name: "주간 베스트", displayOrder: 1, status: "use" },
      { id: "2-2", name: "월간 베스트", displayOrder: 2, status: "use" },
    ],
  },
  3: {
    name: "아우터",
    parent: "women",
    order: 3,
    status: "use",
    children: [
      { id: "3-1", name: "재킷", displayOrder: 1, status: "use" },
      { id: "3-2", name: "코트", displayOrder: 2, status: "unused" },
    ],
  },
  4: {
    name: "액세서리",
    parent: "",
    order: 4,
    status: "unused",
    children: [
      { id: "4-1", name: "가방", displayOrder: 1, status: "use" },
      { id: "4-2", name: "주얼리", displayOrder: 2, status: "unused" },
    ],
  },
  5: {
    name: "기획전",
    parent: "",
    order: 5,
    status: "use",
    children: [
      { id: "5-1", name: "시즌 기획전", displayOrder: 1, status: "use" },
      { id: "5-2", name: "브랜드 기획전", displayOrder: 2, status: "use" },
    ],
  },
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const { categoryId } = useParams();
  const category = categoryMap[categoryId] ?? {
    name: "",
    parent: "",
    order: 1,
    status: "use",
    children: [],
  };

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
        <Stack component="form" spacing={2.5} sx={{ maxWidth: 640 }}>
          <TextField
            disabled
            label="카테고리 ID"
            value={categoryId}
          />
          <TextField
            required
            defaultValue={category.name}
            label="카테고리 명"
          />
          <FormControl>
            <InputLabel id="parent-category-label">상위 카테고리</InputLabel>
            <Select
              defaultValue={category.parent}
              label="상위 카테고리"
              labelId="parent-category-label"
            >
              <MenuItem value="">없음</MenuItem>
              <MenuItem value="new">신상품</MenuItem>
              <MenuItem value="best">베스트</MenuItem>
              <MenuItem value="women">여성의류</MenuItem>
            </Select>
          </FormControl>
          <TextField
            defaultValue={category.order}
            inputProps={{ min: 1 }}
            label="노출 순서"
            type="number"
          />
          <FormControl>
            <InputLabel id="category-status-label">상태</InputLabel>
            <Select
              defaultValue={category.status}
              label="상태"
              labelId="category-status-label"
            >
              <MenuItem value="use">사용</MenuItem>
              <MenuItem value="unused">미사용</MenuItem>
            </Select>
          </FormControl>

          <ChildCategoryEditor initialRows={category.children} />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button color="inherit" onClick={() => router.push("/categories")}>
              목록
            </Button>
            <Button variant="contained" onClick={() => router.push("/categories")}>
              저장
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
