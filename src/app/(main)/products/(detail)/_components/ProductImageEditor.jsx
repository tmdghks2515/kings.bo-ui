"use client";

import { useRef, useState } from "react";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { fileService } from "@/api/file/fileService";

const toUploadedImage = (fileResource, fallbackFile) => {
  if (!fileResource.storageKey) {
    throw new Error("업로드 응답에 storageKey가 없습니다.");
  }

  return {
    storageKey: fileResource.storageKey,
    originalName:
      fileResource.originalName ?? fallbackFile?.name ?? fileResource.storageKey,
    contentType: fileResource.contentType ?? fallbackFile?.type ?? "",
    extension: fileResource.extension ?? "",
    sizeBytes: fileResource.sizeBytes ?? fallbackFile?.size ?? 0,
  };
};

const formatFileSize = (sizeBytes) => {
  if (!sizeBytes) {
    return "-";
  }

  if (sizeBytes < 1024 * 1024) {
    return `${Math.round(sizeBytes / 1024)} KB`;
  }

  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function ProductImageEditor({
  detailImages,
  disabled = false,
  images,
  onDetailImagesChange,
  onImagesChange,
}) {
  const imageInputRef = useRef(null);
  const detailImageInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadFiles = async (files, target) => {
    if (!files?.length) {
      return;
    }

    setErrorMessage("");
    setUploadTarget(target);

    try {
      const uploadedFiles = [];
      for (const file of files) {
        const uploadedFile = await fileService.uploadFile(file);
        uploadedFiles.push(toUploadedImage(uploadedFile, file));
      }

      if (target === "images") {
        const nextImages = [
          ...images,
          ...uploadedFiles.map((file, index) => ({
            ...file,
            main: images.length === 0 && index === 0,
          })),
        ];
        onImagesChange(nextImages);
      } else {
        onDetailImagesChange([...detailImages, ...uploadedFiles]);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setUploadTarget(null);
    }
  };

  const handleRemoveImage = (storageKey) => {
    const nextImages = images.filter(
      (image) => image.storageKey !== storageKey,
    );

    if (nextImages.length > 0 && !nextImages.some((image) => image.main)) {
      nextImages[0] = {
        ...nextImages[0],
        main: true,
      };
    }

    onImagesChange(nextImages);
  };

  const handleMainImageChange = (storageKey) => {
    onImagesChange(
      images.map((image) => ({
        ...image,
        main: image.storageKey === storageKey,
      })),
    );
  };

  const handleRemoveDetailImage = (storageKey) => {
    onDetailImagesChange(
      detailImages.filter((image) => image.storageKey !== storageKey),
    );
  };

  const isUploadingImages = uploadTarget === "images";
  const isUploadingDetailImages = uploadTarget === "detailImages";

  return (
    <Stack spacing={2.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack
            alignItems={{ xs: "stretch", sm: "center" }}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                상품 이미지
              </Typography>
              <Typography color="text.secondary" variant="body2">
                목록과 상품 영역에 노출할 이미지를 등록합니다.
              </Typography>
            </Box>

            <input
              ref={imageInputRef}
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => {
                uploadFiles(Array.from(event.target.files ?? []), "images");
                event.target.value = "";
              }}
            />
            <Button
              disabled={disabled || Boolean(uploadTarget)}
              startIcon={
                isUploadingImages ? (
                  <CircularProgress color="inherit" size={16} />
                ) : (
                  <AddPhotoAlternateIcon fontSize="small" />
                )
              }
              variant="outlined"
              onClick={() => imageInputRef.current?.click()}
            >
              이미지 추가
            </Button>
          </Stack>

          {images.length === 0 ? (
            <EmptyImageState />
          ) : (
            <List disablePadding>
              {images.map((image) => (
                <ListItem
                  key={image.storageKey}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      disabled={disabled || Boolean(uploadTarget)}
                      onClick={() => handleRemoveImage(image.storageKey)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Radio
                    checked={image.main}
                    disabled={disabled || Boolean(uploadTarget)}
                    onChange={() => handleMainImageChange(image.storageKey)}
                  />
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ImageIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack alignItems="center" direction="row" spacing={1}>
                        <span>{image.originalName ?? image.storageKey}</span>
                        {image.main ? (
                          <Chip color="primary" label="대표" size="small" />
                        ) : null}
                      </Stack>
                    }
                    secondary={formatFileSize(image.sizeBytes)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: 1, borderColor: "divider", p: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack
            alignItems={{ xs: "stretch", sm: "center" }}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                상세 이미지
              </Typography>
              <Typography color="text.secondary" variant="body2">
                상품 상세 영역에 순서대로 노출할 이미지를 등록합니다.
              </Typography>
            </Box>

            <input
              ref={detailImageInputRef}
              hidden
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => {
                uploadFiles(
                  Array.from(event.target.files ?? []),
                  "detailImages",
                );
                event.target.value = "";
              }}
            />
            <Button
              disabled={disabled || Boolean(uploadTarget)}
              startIcon={
                isUploadingDetailImages ? (
                  <CircularProgress color="inherit" size={16} />
                ) : (
                  <AddPhotoAlternateIcon fontSize="small" />
                )
              }
              variant="outlined"
              onClick={() => detailImageInputRef.current?.click()}
            >
              이미지 추가
            </Button>
          </Stack>

          {detailImages.length === 0 ? (
            <EmptyImageState />
          ) : (
            <List disablePadding>
              {detailImages.map((image, index) => (
                <ListItem
                  key={image.storageKey}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      disabled={disabled || Boolean(uploadTarget)}
                      onClick={() =>
                        handleRemoveDetailImage(image.storageKey)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ImageIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${index + 1}. ${image.originalName ?? image.storageKey}`}
                    secondary={formatFileSize(image.sizeBytes)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function EmptyImageState() {
  return (
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
  );
}
