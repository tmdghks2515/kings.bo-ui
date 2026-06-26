"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
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
  Tooltip,
  Typography,
} from "@mui/material";

const EMPTY_ROWS = [];

const optionTypes = [
  { label: "용량", value: "CAPACITY" },
  { label: "색상", value: "COLOR" },
  { label: "사이즈", value: "SIZE" },
  { label: "기타", value: "ETC" },
];

const createOptionRow = (order) => ({
  id: `new-${order}`,
  name: "",
  price: "",
  type: "ETC",
});

export default function ProductOptionEditor({
  disabled = false,
  initialRows = EMPTY_ROWS,
  onRowsChange,
}) {
  const [rows, setRows] = useState(initialRows);
  const [nextOrder, setNextOrder] = useState(initialRows.length + 1);

  useEffect(() => {
    setRows(initialRows);
    setNextOrder(initialRows.length + 1);
  }, [initialRows]);

  useEffect(() => {
    onRowsChange?.(rows);
  }, [onRowsChange, rows]);

  const handleAdd = () => {
    setRows((currentRows) => [...currentRows, createOptionRow(nextOrder)]);
    setNextOrder((currentOrder) => currentOrder + 1);
  };

  const handleRemove = (id) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRows((currentRows) =>
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
            상품 옵션
          </Typography>
          <Typography color="text.secondary" variant="body2">
            색상, 사이즈 등 판매 옵션이 필요한 경우 추가합니다.
          </Typography>
        </Box>

        <Button
          disabled={disabled}
          startIcon={<AddIcon fontSize="small" />}
          variant="outlined"
          onClick={handleAdd}
        >
          추가
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
            등록된 옵션이 없습니다.
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
                <TableCell sx={{ fontWeight: 700 }}>옵션명</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 190 }}>
                  <Stack alignItems="center" direction="row" spacing={0.5}>
                    <span>옵션 판매가</span>
                    <Tooltip
                      arrow
                      title="비워두면 상품 기본 판매가를 사용하고, 값을 입력하면 해당 옵션은 입력한 가격으로 판매됩니다."
                    >
                      <HelpOutlineIcon color="action" fontSize="small" />
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, width: 180 }}>
                  옵션 유형
                </TableCell>
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
                      disabled={disabled}
                      placeholder="옵션명을 입력하세요"
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
                      disabled={disabled}
                      inputProps={{ min: 0 }}
                      placeholder="기본가 사용"
                      size="small"
                      type="number"
                      value={row.price}
                      onChange={(event) =>
                        handleChange(row.id, "price", event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`option-type-${row.id}`}>유형</InputLabel>
                      <Select
                        disabled={disabled}
                        label="유형"
                        labelId={`option-type-${row.id}`}
                        value={row.type}
                        onChange={(event) =>
                          handleChange(row.id, "type", event.target.value)
                        }
                      >
                        {optionTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label={`${index + 1}번째 옵션 삭제`}
                      color="error"
                      disabled={disabled}
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
