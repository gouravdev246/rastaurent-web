import { getAnalyticsData } from './actions';
import AnalyticsView from './analytics-view';

export default async function CustomersPage() {
    const data = await getAnalyticsData();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Customer Analytics</h1>
                <p className="text-muted-foreground mt-2">Overview of your customers, orders, and revenue performance.</p>
            </div>

            <AnalyticsView data={data} />
        </div>
    );
}
