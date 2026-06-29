"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export default function BrandSelect({
  brands = [],
  disabled = false,
  value,
  onChange,
}) {
  const brandOptions = Array.isArray(brands) ? brands : [];

  return (
    <FormControl fullWidth>
      <InputLabel id="product-brand-label">브랜드</InputLabel>
      <Select
        disabled={disabled}
        label="브랜드"
        labelId="product-brand-label"
        name="brandId"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">없음</MenuItem>
        {brandOptions.map((brand) => (
          <MenuItem key={brand.id} value={brand.id}>
            {brand.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
