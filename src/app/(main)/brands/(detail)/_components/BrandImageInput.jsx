"use client";

import { useRef, useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { fileService } from "@/api/file/fileService";

const toImage = (fileResource) => ({
  id: fileResource.id,
  originalName: fileResource.originalName,
  storageKey: fileResource.storageKey,
  contentType: fileResource.contentType,
  extension: fileResource.extension,
  sizeBytes: fileResource.sizeBytes,
});

const formatFileSize = (sizeBytes) => {
  if (!sizeBytes) {
    return "-";
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function BrandImageInput({
  disabled = false,
  image,
  title = "대표 이미지",
  description = "브랜드 영역에 노출할 대표 이미지를 등록합니다.",
  onChange,
}) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async (file) => {
    if (!file) {
      return;
    }

    setErrorMessage("");
    setIsUploading(true);

    try {
      const uploadedFile = await fileService.uploadFile(file);
      onChange(toImage(uploadedFile));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {description}
          </Typography>
        </Box>

        <input
          ref={inputRef}
          hidden
          accept="image/*"
          type="file"
          onChange={(event) => {
            handleUpload(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button
          disabled={disabled || isUploading}
          startIcon={
            isUploading ? (
              <CircularProgress color="inherit" size={16} />
            ) : (
              <AddPhotoAlternateIcon fontSize="small" />
            )
          }
          variant="outlined"
          onClick={() => inputRef.current?.click()}
        >
          이미지 선택
        </Button>
      </Stack>

      {image ? (
        <List disablePadding>
          <ListItem
            divider
            secondaryAction={
              <IconButton
                edge="end"
                color="error"
                disabled={disabled || isUploading}
                onClick={() => onChange(null)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ImageIcon color="action" />
            </ListItemIcon>
            <ListItemText
              primary={image.originalName}
              secondary={formatFileSize(image.sizeBytes)}
            />
          </ListItem>
        </List>
      ) : (
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
            등록된 이미지가 없습니다.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
