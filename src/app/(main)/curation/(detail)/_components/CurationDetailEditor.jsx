"use client";

import { useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { fileService } from "@/api/file/fileService";

const DETAIL_TYPE_BY_CURATION_TYPE = {
  MAIN_BANNER: "MainBannerDetail",
  NORMAL_BANNER: "NormalBannerDetail",
  CATEGORIES: "CategoriesDetail",
  TITLED_PRODUCTS: "TitledProductsDetail",
  IMAGE_PRODUCTS: "ImageProductsDetail",
  BRAND_SHORTCUTS: "BrandShortcutsDetail",
};

const curationTypeLabels = {
  MAIN_BANNER: "메인 배너",
  NORMAL_BANNER: "일반 배너",
  CATEGORIES: "카테고리",
  TITLED_PRODUCTS: "타이틀 상품",
  IMAGE_PRODUCTS: "이미지 상품",
  BRAND_SHORTCUTS: "브랜드 바로가기",
};

const linkTypeLabels = {
  ProductDetailLink: "상품",
  CategoryLink: "카테고리",
  BrandLink: "브랜드",
};

const createLink = (type = "ProductDetailLink") => {
  if (type === "CategoryLink") {
    return { type, categoryId: "" };
  }
  if (type === "BrandLink") {
    return { type, brandId: "" };
  }
  return { type: "ProductDetailLink", productCode: "" };
};

const createImageLinkRow = () => ({
  id: crypto.randomUUID(),
  imageStorageKey: "",
  link: createLink(),
});

const createProductCodeRow = (productCode = "") => ({
  id: crypto.randomUUID(),
  productCode,
});

const getImageResource = (item) => {
  if (item?.image && typeof item.image === "object") {
    return item.image;
  }
  if (item?.imageStorageKey && typeof item.imageStorageKey === "object") {
    return item.imageStorageKey;
  }
  return null;
};

const getImageStorageKey = (item) => {
  const image = getImageResource(item);
  return image?.storageKey ?? item.imageStorageKey ?? item.imageUrl ?? "";
};

const normalizeImageLinkRows = (items = []) =>
  (Array.isArray(items) ? items : []).map((item) => {
    const image = getImageResource(item);
    const imageStorageKey = getImageStorageKey(item);

    return {
      id: crypto.randomUUID(),
      imageStorageKey,
      originalName: item.originalName ?? image?.originalName ?? imageStorageKey,
      link: item.link ?? createLink(),
    };
  });

const normalizeProductCodeRows = (productCodes = []) =>
  (Array.isArray(productCodes) ? productCodes : []).map(createProductCodeRow);

const normalizeBrandIds = (brandIds = []) =>
  (Array.isArray(brandIds) ? brandIds : []).map((brandId) => String(brandId));

export const createInitialDetailState = (type) => {
  if (type === "TITLED_PRODUCTS") {
    return {
      title: "",
      productCodes: [createProductCodeRow()],
    };
  }
  if (type === "IMAGE_PRODUCTS") {
    return {
      imageStorageKey: "",
      link: createLink(),
      title: "",
      subTitle: "",
      productCodes: [createProductCodeRow()],
    };
  }
  if (type === "BRAND_SHORTCUTS") {
    return {
      brandIds: [],
    };
  }

  return {
    items: [createImageLinkRow()],
  };
};

export const toDetailState = (type, detail) => {
  if (!detail) {
    return createInitialDetailState(type);
  }

  if (type === "TITLED_PRODUCTS") {
    return {
      title: detail.title ?? "",
      productCodes: normalizeProductCodeRows(detail.productCodes),
    };
  }
  if (type === "IMAGE_PRODUCTS") {
    const image = getImageResource(detail);
    const imageStorageKey = getImageStorageKey(detail);

    return {
      imageStorageKey,
      originalName: detail.originalName ?? image?.originalName ?? imageStorageKey,
      link: detail.link ?? createLink(),
      title: detail.title ?? "",
      subTitle: detail.subTitle ?? "",
      productCodes: normalizeProductCodeRows(detail.productCodes),
    };
  }
  if (type === "BRAND_SHORTCUTS") {
    return {
      brandIds: normalizeBrandIds(detail.brandIds),
    };
  }

  return {
    items: normalizeImageLinkRows(detail.items),
  };
};

const cleanLink = (link) => {
  if (link?.type === "CategoryLink") {
    return {
      type: "CategoryLink",
      categoryId: String(link.categoryId ?? "").trim(),
    };
  }
  if (link?.type === "BrandLink") {
    return {
      type: "BrandLink",
      brandId: String(link.brandId ?? "").trim(),
    };
  }
  return {
    type: "ProductDetailLink",
    productCode: String(link?.productCode ?? "").trim(),
  };
};

export const toCurationDetailPayload = (type, state) => {
  const detailType = DETAIL_TYPE_BY_CURATION_TYPE[type];

  if (type === "TITLED_PRODUCTS") {
    return {
      type: detailType,
      title: String(state.title ?? "").trim(),
      productCodes: state.productCodes.map((row) => row.productCode.trim()).filter(Boolean),
    };
  }
  if (type === "IMAGE_PRODUCTS") {
    return {
      type: detailType,
      imageStorageKey: state.imageStorageKey.trim(),
      link: cleanLink(state.link),
      title: String(state.title ?? "").trim(),
      subTitle: String(state.subTitle ?? "").trim(),
      productCodes: state.productCodes.map((row) => row.productCode.trim()).filter(Boolean),
    };
  }
  if (type === "BRAND_SHORTCUTS") {
    return {
      type: detailType,
      brandIds: state.brandIds.map(Number),
    };
  }

  return {
    type: detailType,
    items: state.items
      .map((row) => ({
        imageStorageKey: row.imageStorageKey.trim(),
        link: cleanLink(row.link),
      }))
      .filter((row) => row.imageStorageKey),
  };
};

export default function CurationDetailEditor({
  brands = [],
  categories = [],
  disabled = false,
  products = [],
  type,
  value,
  onChange,
}) {
  const brandOptions = Array.isArray(brands) ? brands : [];
  const categoryOptions = Array.isArray(categories) ? categories : [];
  const productOptions = Array.isArray(products)
    ? products
    : Array.isArray(products?.content)
      ? products.content
      : Array.isArray(products?.items)
        ? products.items
        : [];

  if (type === "TITLED_PRODUCTS") {
    return (
      <Stack spacing={2}>
        <TextField
          required
          disabled={disabled}
          label="타이틀"
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
        />
        <ProductCodeRows
          disabled={disabled}
          products={productOptions}
          rows={value.productCodes}
          onChange={(productCodes) => onChange({ ...value, productCodes })}
        />
      </Stack>
    );
  }

  if (type === "IMAGE_PRODUCTS") {
    return (
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            required
            disabled={disabled}
            fullWidth
            label="타이틀"
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
          />
          <TextField
            disabled={disabled}
            fullWidth
            label="서브 타이틀"
            value={value.subTitle}
            onChange={(event) => onChange({ ...value, subTitle: event.target.value })}
          />
        </Stack>
        <ImageUploadInput
          disabled={disabled}
          value={value}
          onChange={(image) => onChange({ ...value, ...image })}
        />
        <LinkEditor
          brands={brandOptions}
          categories={categoryOptions}
          disabled={disabled}
          products={productOptions}
          value={value.link}
          onChange={(link) => onChange({ ...value, link })}
        />
        <ProductCodeRows
          disabled={disabled}
          products={productOptions}
          rows={value.productCodes}
          onChange={(productCodes) => onChange({ ...value, productCodes })}
        />
      </Stack>
    );
  }

  if (type === "BRAND_SHORTCUTS") {
    return (
      <BrandShortcutSelect
        brands={brandOptions}
        disabled={disabled}
        value={value.brandIds}
        onChange={(brandIds) => onChange({ ...value, brandIds })}
      />
    );
  }

  return (
    <ImageLinkRows
      brands={brandOptions}
      categories={categoryOptions}
      disabled={disabled}
      products={productOptions}
      rows={value.items}
      onChange={(items) => onChange({ ...value, items })}
    />
  );
}

export function CurationTypeSelect({ disabled = false, value, onChange }) {
  return (
    <FormControl fullWidth>
      <InputLabel id="curation-type-label">큐레이션 타입</InputLabel>
      <Select
        disabled={disabled}
        label="큐레이션 타입"
        labelId="curation-type-label"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {Object.entries(curationTypeLabels).map(([type, label]) => (
          <MenuItem key={type} value={type}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const getCurationTypeLabel = (type) => curationTypeLabels[type] ?? type;

function ImageLinkRows({
  brands,
  categories,
  disabled,
  products,
  rows,
  onChange,
}) {
  const handleRowChange = (rowId, updater) => {
    onChange(rows.map((row) => (row.id === rowId ? updater(row) : row)));
  };

  return (
    <Stack spacing={1.5}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          큐레이션 항목
        </Typography>
        <Button
          disabled={disabled}
          startIcon={<AddIcon fontSize="small" />}
          variant="outlined"
          onClick={() => onChange([...rows, createImageLinkRow()])}
        >
          항목 추가
        </Button>
      </Stack>

      {rows.map((row, index) => (
        <Paper key={row.id} elevation={0} sx={{ border: 1, borderColor: "divider", p: 2 }}>
          <Stack spacing={2}>
            <Stack alignItems="center" direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                항목 {index + 1}
              </Typography>
              <IconButton
                color="error"
                disabled={disabled || rows.length <= 1}
                onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>

            <ImageUploadInput
              disabled={disabled}
              value={row}
              onChange={(image) =>
                handleRowChange(row.id, (item) => ({
                  ...item,
                  ...image,
                }))
              }
            />

            <LinkEditor
              brands={brands}
              categories={categories}
              disabled={disabled}
              products={products}
              value={row.link}
              onChange={(link) => handleRowChange(row.id, (item) => ({ ...item, link }))}
            />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function ImageUploadInput({ disabled, value, onChange }) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const imageStorageKey = value.imageStorageKey ?? "";
  const imageName = value.originalName || imageStorageKey;

  const handleUpload = async (file) => {
    if (!file) {
      return;
    }

    setErrorMessage("");
    setIsUploading(true);

    try {
      const uploadedFile = await fileService.uploadFile(file);
      if (!uploadedFile.storageKey) {
        throw new Error("업로드 응답에 storageKey가 없습니다.");
      }

      onChange({
        imageStorageKey: uploadedFile.storageKey,
        originalName: uploadedFile.originalName ?? file.name ?? uploadedFile.storageKey,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Stack spacing={1}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Stack
        alignItems={{ xs: "stretch", sm: "center" }}
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            이미지
          </Typography>
          <Typography color="text.secondary" variant="body2">
            큐레이션 영역에 노출할 이미지를 등록합니다.
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

      {imageStorageKey ? (
        <List disablePadding>
          <ListItem divider>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ImageIcon color="action" />
            </ListItemIcon>
            <ListItemText primary={imageName} secondary={imageStorageKey} />
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

function LinkEditor({ brands, categories, disabled, products, value, onChange }) {
  const linkType = value?.type ?? "ProductDetailLink";

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
      <FormControl fullWidth>
        <InputLabel id="link-type-label">링크 타입</InputLabel>
        <Select
          disabled={disabled}
          label="링크 타입"
          labelId="link-type-label"
          value={linkType}
          onChange={(event) => onChange(createLink(event.target.value))}
        >
          {Object.entries(linkTypeLabels).map(([type, label]) => (
            <MenuItem key={type} value={type}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {linkType === "CategoryLink" ? (
        <CategorySelect
          categories={categories}
          disabled={disabled}
          value={value.categoryId ?? ""}
          onChange={(categoryId) => onChange({ type: linkType, categoryId })}
        />
      ) : null}

      {linkType === "BrandLink" ? (
        <FormControl fullWidth>
          <InputLabel id="brand-link-label">브랜드</InputLabel>
          <Select
            disabled={disabled}
            label="브랜드"
            labelId="brand-link-label"
            value={value.brandId ?? ""}
            onChange={(event) => onChange({ type: linkType, brandId: event.target.value })}
          >
            <MenuItem value="">선택</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={String(brand.id)}>
                {brand.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}

      {linkType === "ProductDetailLink" ? (
        <ProductCodeSelect
          disabled={disabled}
          products={products}
          value={value.productCode ?? ""}
          onChange={(productCode) => onChange({ type: linkType, productCode })}
        />
      ) : null}
    </Stack>
  );
}

function ProductCodeRows({ disabled, products, rows, onChange }) {
  return (
    <Stack spacing={1.5}>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          상품 코드
        </Typography>
        <Button
          disabled={disabled}
          startIcon={<AddIcon fontSize="small" />}
          variant="outlined"
          onClick={() => onChange([...rows, createProductCodeRow()])}
        >
          상품 추가
        </Button>
      </Stack>

      {rows.map((row, index) => (
        <Stack key={row.id} alignItems="center" direction="row" spacing={1}>
          <Box sx={{ color: "text.secondary", width: 32 }}>{index + 1}</Box>
          <ProductCodeSelect
            disabled={disabled}
            products={products}
            value={row.productCode}
            onChange={(productCode) =>
              onChange(rows.map((item) => (item.id === row.id ? { ...item, productCode } : item)))
            }
          />
          <IconButton
            color="error"
            disabled={disabled || rows.length <= 1}
            onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
}

function ProductCodeSelect({ disabled, products, value, onChange }) {
  return (
    <FormControl fullWidth>
      <InputLabel id="product-code-label">상품</InputLabel>
      <Select
        disabled={disabled}
        label="상품"
        labelId="product-code-label"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">선택</MenuItem>
        {products.map((product) => (
          <MenuItem key={product.code} value={product.code}>
            {product.name ? `${product.code} - ${product.name}` : product.code}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function BrandShortcutSelect({ brands, disabled, value, onChange }) {
  const selectedBrandIds = Array.isArray(value) ? value : [];
  const brandNameById = new Map(brands.map((brand) => [String(brand.id), brand.name]));

  return (
    <FormControl fullWidth>
      <InputLabel id="brand-shortcut-label">노출 브랜드</InputLabel>
      <Select
        multiple
        disabled={disabled}
        label="노출 브랜드"
        labelId="brand-shortcut-label"
        value={selectedBrandIds}
        renderValue={(selected) =>
          selected.map((brandId) => brandNameById.get(String(brandId)) ?? brandId).join(", ")
        }
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(typeof nextValue === "string" ? nextValue.split(",") : nextValue);
        }}
      >
        {brands.map((brand) => {
          const brandId = String(brand.id);

          return (
            <MenuItem key={brand.id} value={brandId}>
              <Checkbox checked={selectedBrandIds.includes(brandId)} />
              <ListItemText primary={brand.name} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

function CategorySelect({ categories, disabled, value, onChange }) {
  const options = flattenCategories(Array.isArray(categories) ? categories : []);

  return (
    <FormControl fullWidth>
      <InputLabel id="category-link-label">카테고리</InputLabel>
      <Select
        disabled={disabled}
        label="카테고리"
        labelId="category-link-label"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">선택</MenuItem>
        {options.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>
            {category.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

const flattenCategories = (categories, prefix = "") =>
  categories.flatMap((category) => {
    const label = prefix ? `${prefix} > ${category.name}` : category.name;
    return [{ id: category.id, label }, ...flattenCategories(category.children ?? [], label)];
  });
