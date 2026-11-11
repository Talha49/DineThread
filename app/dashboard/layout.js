"use client";

import { useState, useEffect } from "react";
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

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
        setIsMobileOpen(!isMobileOpen);
    } else {
        setIsDesktopOpen(!isDesktopOpen);
    }
  };

  return (
    <ImageUploadProvider>
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop Sidebar - Collapsible */}
      <div className={cn(
          "hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out border-r bg-card h-full overflow-hidden",
          isDesktopOpen ? "w-64 opacity-100" : "w-0 opacity-0 border-none"
      )}>
         <Sidebar className="w-64 h-full" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar isMobile onClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />
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
