"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const flattenCategories = (categories, prefix = "") =>
  categories.flatMap((category) => {
    const label = prefix ? `${prefix} > ${category.name}` : category.name;
    const item = {
      id: category.id,
      label,
    };

    return [item, ...flattenCategories(category.children ?? [], label)];
  });

export default function CategorySelect({ categories = [], disabled = false, value, onChange }) {
  const categoryOptions = flattenCategories(Array.isArray(categories) ? categories : []);

  return (
    <FormControl fullWidth>
      <InputLabel id="product-category-label">카테고리</InputLabel>
      <Select
        disabled={disabled}
        label="카테고리"
        labelId="product-category-label"
        name="categoryId"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">없음</MenuItem>
        {categoryOptions.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
