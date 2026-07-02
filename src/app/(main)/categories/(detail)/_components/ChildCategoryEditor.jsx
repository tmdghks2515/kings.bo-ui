"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Button,
  IconButton,
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

const createChildCategory = (order) => ({
  id: `new-${order}`,
  name: "",
});

const EMPTY_ROWS = [];

export default function ChildCategoryEditor({
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

  const handleMove = (index, direction) => {
    updateRows((currentRows) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= currentRows.length) {
        return currentRows;
      }

      const nextRows = [...currentRows];
      [nextRows[index], nextRows[targetIndex]] = [
        nextRows[targetIndex],
        nextRows[index],
      ];

      return nextRows;
    });
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
        </Box>

        <Button
          startIcon={<AddIcon fontSize="small" />}
          variant="outlined"
          onClick={handleAdd}
        >
          추가
        </Button>
      </Stack>

      {rows.length === 0 ? (
        <></>
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
                <TableCell sx={{ fontWeight: 700, width: 110 }}>순서 이동</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>하위 카테고리 명</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 80 }}>
                  삭제
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="위로 이동">
                        <span>
                          <IconButton
                            disabled={index === 0}
                            size="small"
                            onClick={() => handleMove(index, -1)}
                          >
                            <KeyboardArrowUpIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="아래로 이동">
                        <span>
                          <IconButton
                            disabled={index === rows.length - 1}
                            size="small"
                            onClick={() => handleMove(index, 1)}
                          >
                            <KeyboardArrowDownIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
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
