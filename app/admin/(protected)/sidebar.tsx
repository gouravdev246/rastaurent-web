'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UtensilsCrossed,
    QrCode,
    LogOut,
    ClipboardList,
    Image,
    Users,
    Menu,
    X
} from 'lucide-react';
import { logout } from '../actions';

type SidebarProps = {
    user: {
        email: string | undefined;
    };
};

export default function Sidebar({ user }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { href: '/admin/orders', icon: ClipboardList, label: 'Live Orders' },
        { href: '/admin/tables', icon: QrCode, label: 'Tables & QR' },
        { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Items' },
        { href: '/admin/branding', icon: Image, label: 'Posters' },
        { href: '/admin/customers', icon: Users, label: 'Customers' },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col hidden lg:flex h-screen sticky top-0">
                <div className="p-6 border-b border-border flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <UtensilsCrossed className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Admin Console</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            href={link.href}
                            icon={<link.icon size={20} />}
                            active={pathname === link.href}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                            {user.email}
                        </div>
                    </div>

                    <form action={logout}>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-[60] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/20 p-1.5 rounded-lg">
                            <UtensilsCrossed className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold tracking-tight">Admin Console</span>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            {/* Mobile Sidebar (Drawer) */}
            <aside className={`
                lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border z-[80] shadow-2xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <UtensilsCrossed className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Admin</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.href}
                            href={link.href}
                            icon={<link.icon size={20} />}
                            onClick={toggleSidebar}
                            active={pathname === link.href}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{user.email?.split('@')[0]}</p>
                            <p className="text-xs">{user.email}</p>
                        </div>
                    </div>

                    <form action={logout}>
                        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20">
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}

function NavLink({
    href,
    icon,
    children,
    onClick,
    active
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group
                ${active
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
            `}
        >
            <span className={active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary transition-colors'}>
                {icon}
            </span>
            {children}
        </Link>
    );
}
