import { getPosters, getMenuItemsForSelection } from './actions';
import PostersManager from './posters-manager';

export default async function PostersPage() {
    const [posters, menuItems] = await Promise.all([
        getPosters(),
        getMenuItemsForSelection()
    ]);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Offer Posters</h1>
                <p className="text-muted-foreground">
                    Manage promotional posters that appear on the customer menu app.
                </p>
            </div>

            <PostersManager initialPosters={posters} menuItems={menuItems} />
        </div>
    );
}
