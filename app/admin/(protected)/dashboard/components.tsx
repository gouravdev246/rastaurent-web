
export function StatCard({ title, value, subtitle, trend }: any) {
    return (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all group">
            <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-1">{title}</h3>
            <p className="text-3xl font-bold group-hover:text-primary transition-colors">{value}</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                {trend === 'up' && <span className="text-green-500">↑</span>}
                {subtitle}
            </p>
        </div>
    )
}

export function QuickAction({ href, label }: { href: string, label: string }) {
    return (
        <a href={href} className="flex items-center justify-center p-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all font-medium text-sm text-center h-24">
            {label}
        </a>
    )
}
