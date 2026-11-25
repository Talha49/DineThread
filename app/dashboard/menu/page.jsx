"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { useMenuStore } from "@/hooks/use-menu-store";
import { useCategoryStore } from "@/hooks/use-category-store";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Plus, Eye, Search } from "lucide-react";
import { MenuItemsTab } from "./MenuItemsTab";
import { CategoriesTab } from "./CategoriesTab";
import { Modal } from "@/components/ui/Modal";
import { LivePreview } from "@/components/settings/LivePreview";
import { useRestaurantStore } from "@/hooks/use-restaurant-store";
import { useTranslation } from "@/store/useTranslation";

// Lazy load the modal for better initial load performance
const MenuItemModal = lazy(() => import("@/components/dashboard/MenuItemModal").then(module => ({ default: module.MenuItemModal })));

export default function UnifiedMenuPage() {
    const { fetchItems, items: menuItems, setFocusedItem } = useMenuStore();
    const { fetchCategories, categories } = useCategoryStore();
    const { restaurant: restaurantData } = useRestaurantStore();
    const { t } = useTranslation();

    // Local State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [activeTab, setActiveTab] = useState("items");

    // Initial Fetch
    useEffect(() => {
        fetchItems();
        fetchCategories();
    }, []);

    // Handlers
    const handleCreateItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleRefresh = () => {
        fetchItems(true);
    };

    if (!restaurantData) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in">
                <div className="w-24 h-24 bg-muted/30 rounded-[2rem] flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <h1 className="text-4xl font-display font-bold tracking-tight text-foreground mb-3">{t('dashboard.menu.not_found_title') || "Restaurant Not Found (404)"}</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{t('dashboard.menu.not_found_desc') || "Your restaurant data could not be found or has been deleted. Please complete onboarding to create a new restaurant profile."}</p>
                <Button size="lg" onClick={() => window.location.href = '/onboarding'} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
                    {t('dashboard.menu.go_onboarding') || "Create Restaurant Profile"}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">{t('dashboard.menu.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('dashboard.menu.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => setIsPreviewOpen(true)}
                        className="shadow-sm border-primary/10 hover:border-primary/30 transition-all font-medium"
                    >
                        <Eye className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('dashboard.menu.view_preview')}
                    </Button>
                    {activeTab === "items" && (
                        <Button onClick={handleCreateItem} size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2" /> {t('dashboard.menu.add_item')}
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
                    <TabsTrigger value="items">{t('dashboard.menu.tabs.items')}</TabsTrigger>
                    <TabsTrigger value="categories">{t('dashboard.menu.tabs.categories')}</TabsTrigger>
                </TabsList>

                {/* --- MENU ITEMS TAB --- */}
                <TabsContent value="items">
                    <MenuItemsTab
                        onCreateItem={handleCreateItem}
                        onEditItem={handleEditItem}
                    />
                </TabsContent>

                {/* --- CATEGORIES TAB --- */}
                <TabsContent value="categories">
                    <CategoriesTab />
                </TabsContent>
            </Tabs>

            {/* Lazy Loaded Modal */}
            <Suspense fallback={null}>
                {isModalOpen && (
                    <MenuItemModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        initialData={editingItem}
                        onRefresh={handleRefresh}
                    />
                )}
            </Suspense>

            {/* Live Preview Modal */}
            {isPreviewOpen && (
                <Modal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    title={t('dashboard.menu.preview_title')}
                    description={t('dashboard.menu.preview_desc')}
                    size="xl"
                >
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl overflow-hidden min-h-[600px] relative">
                        {/* Smaller scale and centered transform to ensure it fits perfectly */}
                        <div className="scale-[0.6] sm:scale-[0.65] md:scale-[0.7] transform-gpu origin-center shrink-0">
                            <LivePreview
                                restaurant={restaurantData}
                                branding={{
                                    brandColor: restaurantData?.brandColor || "#4f46e5",
                                    fontFamily: restaurantData?.fontFamily || "Inter",
                                    logoUrl: restaurantData?.logoUrl || ""
                                }}
                                menuItems={menuItems}
                                categories={categories}
                                onItemClick={(item) => {
                                    setFocusedItem(item._id);
                                    setIsPreviewOpen(false);
                                }}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
