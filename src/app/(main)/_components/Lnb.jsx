"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WebIcon from "@mui/icons-material/Web";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
} from "@mui/material";
import Image from "next/image";

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
    label: "브랜드 관리",
    href: "/brands",
    icon: <StorefrontIcon fontSize="small" />,
  },
  {
    label: "상품 관리",
    href: "/products",
    icon: <Inventory2Icon fontSize="small" />,
  },
  {
    label: "전시 페이지 관리",
    href: "/curation/page",
    icon: <WebIcon fontSize="small" />,
  },
  {
    label: "사용자 관리",
    href: "/users",
    icon: <ManageAccountsIcon fontSize="small" />,
  },
];

function LnbContent({ collapsed = false, onNavigate, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <Toolbar
        sx={{
          justifyContent: collapsed ? "center" : "space-between",
          minHeight: { xs: 56, md: 64 },
          px: collapsed ? 1 : 2,
          py: 1,
        }}
      >
        <Stack alignItems="center" justifyContent="center" sx={{ minWidth: 0 }}>
          <Image
            src={collapsed ? "/logo/thekingslogosmall.png" : "/logo/thekingstextlogo.png"}
            width={collapsed ? 36 : 132}
            height={collapsed ? 36 : 32}
            alt="THE KINGS"
            style={{ height: "auto", maxWidth: "100%" }}
          />
        </Stack>

        {onClose && (
          <Tooltip title="메뉴 닫기">
            <IconButton aria-label="메뉴 닫기" edge="end" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      <Divider />

      <List dense={false} sx={{ px: collapsed ? 1 : 1.5 }}>
        {menuItems.map((item) => {
          const selected = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Tooltip key={item.href} arrow placement="right" title={collapsed ? item.label : ""}>
              <ListItemButton
                aria-label={item.label}
                component={Link}
                href={item.href}
                selected={selected}
                sx={{
                  borderRadius: 1,
                  justifyContent: collapsed ? "center" : "flex-start",
                  mb: 0.5,
                  minHeight: 44,
                  px: collapsed ? 1 : 2,
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
                onClick={onNavigate}
              >
                <ListItemIcon sx={{ justifyContent: "center", minWidth: collapsed ? 0 : 36 }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </>
  );
}

export default function Lnb({
  collapsedWidth,
  expandedWidth,
  isDesktopCollapsed,
  isMobileOpen,
  onMobileClose,
}) {
  const desktopWidth = isDesktopCollapsed ? collapsedWidth : expandedWidth;

  const paperSx = {
    bgcolor: "background.paper",
    borderRight: 1,
    borderColor: "divider",
    overflowX: "hidden",
  };

  return (
    <>
      <Drawer
        ModalProps={{ keepMounted: true }}
        open={isMobileOpen}
        PaperProps={{
          sx: {
            ...paperSx,
            width: `min(82vw, ${expandedWidth}px)`,
          },
        }}
        sx={{ display: { xs: "block", md: "none" } }}
        variant="temporary"
        onClose={onMobileClose}
      >
        <LnbContent onClose={onMobileClose} onNavigate={onMobileClose} />
      </Drawer>

      <Drawer
        open
        PaperProps={{
          sx: {
            ...paperSx,
            transition: (theme) =>
              theme.transitions.create("width", {
                duration: theme.transitions.duration.shorter,
                easing: theme.transitions.easing.sharp,
              }),
            width: desktopWidth,
          },
        }}
        sx={{
          display: { xs: "none", md: "block" },
          flexShrink: 0,
          transition: (theme) =>
            theme.transitions.create("width", {
              duration: theme.transitions.duration.shorter,
              easing: theme.transitions.easing.sharp,
            }),
          width: desktopWidth,
        }}
        variant="permanent"
      >
        <LnbContent collapsed={isDesktopCollapsed} />
      </Drawer>
    </>
  );
}
