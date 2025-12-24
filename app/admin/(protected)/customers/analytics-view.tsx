'use client';

import { CustomerStats, DashboardStats } from './actions';
import { DollarSign, ShoppingBag, Calendar, Users, TrendingUp } from 'lucide-react';

export default function AnalyticsView({ data }: { data: DashboardStats }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={`₹${data.revenue.daily.toFixed(2)}`}
                    subValue={`${data.orders.daily} orders`}
                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                    trend="Daily"
                />
                <StatCard
                    title="Weekly Revenue"
                    value={`₹${data.revenue.weekly.toFixed(2)}`}
                    subValue={`${data.orders.weekly} orders`}
                    icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
                    trend="Last 7 Days"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${data.revenue.monthly.toFixed(2)}`}
                    subValue={`${data.orders.monthly} orders`}
                    icon={<Calendar className="w-6 h-6 text-purple-600" />}
                    trend="This Month"
                />
                <StatCard
                    title="Total Customers"
                    value={data.customers.length.toString()}
                    subValue="Unique visitors"
                    icon={<Users className="w-6 h-6 text-orange-600" />}
                    trend="All Time"
                />
            </div>

            {/* Customer List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold">Recent Customers</h2>
                    <p className="text-sm text-muted-foreground">List of customers by recent activity</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground font-semibold">
                            <tr>
                                <th className="px-6 py-4">Customer Name</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Total Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Last Visit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {data.customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No customer data available yet.
                                    </td>
                                </tr>
                            ) : (
                                data.customers.slice(0, 50).map((customer, i) => (
                                    <tr key={i} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{customer.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{customer.phone}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {customer.totalOrders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-green-600">
                                            ₹{customer.totalSpent.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(customer.lastVisit).toLocaleDateString()}
                                            <span className="text-xs ml-2 opacity-50">
                                                {new Date(customer.lastVisit).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {data.customers.length > 50 && (
                    <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
                        Showing top 50 recents
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon, trend }: { title: string, value: string, subValue: string, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-secondary/50 p-3 rounded-lg">
                    {icon}
                </div>
                <span className="text-xs font-medium bg-secondary text-muted-foreground px-2 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
                <div className="text-2xl font-bold mb-1">{value}</div>
                <div className="text-xs text-muted-foreground">{subValue}</div>
            </div>
        </div>
    );
}
