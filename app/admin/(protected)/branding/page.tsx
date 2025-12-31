import { getPosters, getMenuItemsForSelection, getAdminSettings } from './actions';
import PostersManager from './posters-manager';
import RestaurantSettings from './restaurant-settings';

export default async function BrandingPage() {
    const [posters, menuItems, settings] = await Promise.all([
        getPosters(),
        getMenuItemsForSelection(),
        getAdminSettings()
    ]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Branding & Offers</h1>
                <p className="text-muted-foreground">
                    Manage your restaurant's identity and promotional posters.
                </p>
            </div>

            <RestaurantSettings initialName={settings?.restaurant_name || ''} />

            <div className="my-8 border-t border-border" />

            <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">Promotional Posters</h2>
                <p className="text-muted-foreground text-sm">
                    Active posters appear at the top of your digital menu.
                </p>
            </div>

            <PostersManager initialPosters={posters} menuItems={menuItems} />
        </div>
    );
}
