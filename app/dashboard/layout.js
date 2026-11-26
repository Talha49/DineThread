"use client";

import { useState, useEffect, useRef } from "react";
import { useModalFocus } from "@/hooks/use-modal-focus";
import { useTranslation } from "@/store/useTranslation";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useCategoryStore } from "@/hooks/use-category-store";
import { useMenuStore } from "@/hooks/use-menu-store";
import { cn } from "@/lib/utils";
import { ImageUploadProvider } from "@/context/ImageUploadContext";

export default function DashboardLayout({ children }) {
  // Mobile state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Desktop state - default open
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const drawer = useRef(null);
  const closeButton = useRef(null);
  const closeDrawer = () => setIsMobileOpen(false);
  useModalFocus(drawer, isMobileOpen, closeDrawer, closeButton);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobile(mobile.matches);
      if (!mobile.matches) setIsMobileOpen(false);
    };
    update();
    mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, []);

  // Design Studio is a full-bleed, self-scrolling editor (its own
  // h-[calc(100vh-4rem)] pane with two/three internal columns) - the shared
  // page padding + max-w-7xl centering that every other dashboard page wants
  // actively fights it: it eats width the split-pane layout needs, and adds
  // extra vertical space on top of a height calc that already assumes none.
  const isFullBleed = pathname === "/dashboard/settings";

  const fetchRestaurant = useRestaurantStore((state) => state.fetchRestaurant);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const fetchItems = useMenuStore((state) => state.fetchItems);

  useEffect(() => {
    fetchRestaurant();
    fetchCategories();
    fetchItems();
  }, [fetchRestaurant, fetchCategories, fetchItems]);

  const toggleSidebar = (event) => {
    if (isMobile) {
        event.currentTarget.focus();
        setIsMobileOpen(true);
    } else {
        setIsDesktopOpen(!isDesktopOpen);
    }
  };

  return (
    <ImageUploadProvider>
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop Sidebar - Collapsible */}
      <div id="desktop-navigation" inert={!isDesktopOpen} className={cn(
          "hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out border-r bg-card h-full overflow-hidden",
          isDesktopOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-none"
      )}>
         <Sidebar className="w-64 h-full" />
      </div>

      <div id="mobile-navigation" ref={drawer} role="dialog" aria-modal="true"
          aria-label={t("nav.dashboard")} tabIndex={-1} hidden={!isMobileOpen}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={event => { if (event.target === event.currentTarget) closeDrawer(); }}>
        <Sidebar isMobile onClose={closeDrawer} closeButtonRef={closeButton}
            className="h-full w-64 max-w-full shadow-2xl" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} isSidebarOpen={isMobile ? isMobileOpen : isDesktopOpen}
            navigationId={isMobile ? "mobile-navigation" : "desktop-navigation"} />
        <main className={cn("flex-1 overflow-y-auto", !isFullBleed && "p-4 md:p-8")}>
           <div className={cn("animate-fade-in", isFullBleed ? "h-full" : "mx-auto max-w-7xl")}>
              {children}
           </div>
        </main>
      </div>
    </div>
    </ImageUploadProvider>
  );
}
