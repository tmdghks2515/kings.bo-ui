"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WebIcon from "@mui/icons-material/Web";
import {
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

const menuItems = [
  {
    label: "대시보드",
    href: "/",
    icon: <DashboardIcon fontSize="small" />,
  },
  {
    label: "카테고리 관리",
    href: "/categories",
    icon: <CategoryIcon fontSize="small" />,
  },
  {
    label: "상품 관리",
    href: "/products",
    icon: <Inventory2Icon fontSize="small" />,
  },
  {
    label: "전시 관리",
    href: "/display",
    icon: <WebIcon fontSize="small" />,
  },
  {
    label: "회원 관리",
    href: "/members",
    icon: <GroupsIcon fontSize="small" />,
  },
];

export default function Lnb({ drawerWidth }) {
  const pathname = usePathname();

  return (
    <Drawer
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          width: drawerWidth,
        },
      }}
      sx={{
        display: { xs: "none", md: "block" },
        flexShrink: 0,
        width: drawerWidth,
      }}
      variant="permanent"
    >
      <Toolbar sx={{ minHeight: 64, px: 3 }}>
        <Stack spacing={0.25}>
          <Typography component="div" variant="h6" sx={{ fontWeight: 800 }}>
            KINGS BO
          </Typography>
          <Typography color="text.secondary" variant="caption">
            Backoffice Management
          </Typography>
        </Stack>
      </Toolbar>

      <Divider />

      <Box sx={{ px: 2, py: 2 }}>
        <Chip color="primary" label="운영 메뉴" size="small" variant="outlined" />
      </Box>

      <List dense={false} sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const selected =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={selected}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                minHeight: 44,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "primary.light",
                },
                "&.Mui-selected .MuiListItemIcon-root": {
                  color: "primary.contrastText",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
