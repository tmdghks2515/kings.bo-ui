"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const createChildCategory = (order) => ({
  id: `new-${order}`,
  name: "",
  displayOrder: order,
  status: "use",
});

export default function ChildCategoryEditor({ initialRows = [], onRowsChange }) {
  const [rows, setRows] = useState(initialRows);
  const [nextOrder, setNextOrder] = useState(initialRows.length + 1);

  useEffect(() => {
    onRowsChange?.(rows);
  }, [onRowsChange, rows]);

  const updateRows = (updater) => {
    setRows((currentRows) =>
      typeof updater === "function" ? updater(currentRows) : updater,
    );
  };

  const handleAdd = () => {
    updateRows((currentRows) => [...currentRows, createChildCategory(nextOrder)]);
    setNextOrder((currentOrder) => currentOrder + 1);
  };

  const handleRemove = (id) => {
    updateRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    updateRows((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  return (
    <Stack spacing={1.5}>
      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            하위 카테고리
          </Typography>
          <Typography color="text.secondary" variant="body2">
            필요한 경우에만 하위 카테고리를 추가합니다.
          </Typography>
        </Box>

        <Button
          startIcon={<AddIcon fontSize="small" />}
          variant="outlined"
          onClick={handleAdd}
        >
          하위 카테고리 추가
        </Button>
      </Stack>

      {rows.length === 0 ? (
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            px: 2,
            py: 3,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary" variant="body2">
            등록된 하위 카테고리가 없습니다.
          </Typography>
        </Box>
      ) : (
        <TableContainer
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflowX: "auto",
          }}
        >
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: 700 }}>하위 카테고리 명</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 140 }}>노출 순서</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 160 }}>상태</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                  삭제
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <TextField
                      fullWidth
                      placeholder="하위 카테고리 명"
                      size="small"
                      value={row.name}
                      onChange={(event) =>
                        handleChange(row.id, "name", event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      inputProps={{ min: 1 }}
                      size="small"
                      type="number"
                      value={row.displayOrder}
                      onChange={(event) =>
                        handleChange(row.id, "displayOrder", Number(event.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`child-category-status-${row.id}`}>
                        상태
                      </InputLabel>
                      <Select
                        label="상태"
                        labelId={`child-category-status-${row.id}`}
                        value={row.status}
                        onChange={(event) =>
                          handleChange(row.id, "status", event.target.value)
                        }
                      >
                        <MenuItem value="use">사용</MenuItem>
                        <MenuItem value="unused">미사용</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label={`${index + 1}번째 하위 카테고리 삭제`}
                    color="error"
                    size="small"
                    onClick={() => handleRemove(row.id)}
                  >
                      <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
