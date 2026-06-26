"use client";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

const colorByVariant = {
  danger: "error",
  default: "primary",
};

export default function ConfirmDialog({
  cancelText = "취소",
  confirmText = "확인",
  content,
  icon,
  maxWidth = "xs",
  open,
  title,
  variant = "default",
  onCancel,
  onConfirm,
}) {
  const color = colorByVariant[variant] ?? colorByVariant.default;
  const titleIcon = icon ?? <WarningAmberIcon color={color} fontSize="small" />;

  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={onCancel}>
      <DialogTitle>
        <Stack alignItems="center" direction="row" spacing={1}>
          {titleIcon}
          <span>{title}</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {typeof content === "string" ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button color={color} variant="contained" onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
