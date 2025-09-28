import { NavLink } from "react-router-dom";
import { Bell, MessageSquare, Server as ServerIcon, LogOut } from "lucide-react";
import * as React from "react";
import { logout } from "../../services/authService";

type NavItem = {
    to: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
};

const navItems: NavItem[] = [
    { to: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { to: "/chats", label: "Chats", icon: <MessageSquare className="h-5 w-5" /> },
    { to: "/servers", label: "Servers", icon: <ServerIcon className="h-5 w-5" /> },
    { to: "#", label: "Logout", icon: <LogOut className="h-5 w-5" />, onClick: () => logout().then(() => { window.location.href = "/login"; }) },
];

export default function Navbar() {
    return (
        <aside className="md:sticky md:top-0 md:h-screen md:w-56 bg-white border-r md:border-gray-700 fixed bottom-0 w-full border-t border-gray-700 md:border-t-0 z-50">
            <div className="px-4 py-5 border-b border-gray-200 md:block hidden">
                <div className="text-xl font-semibold tracking-tight">Awesomecord</div>
                <div className="text-xs text-gray-500">Made by Eren</div>
            </div>

            <nav className="py-4 md:py-4">
                <ul className="flex md:flex-col justify-around md:space-y-1 md:space-x-0 space-x-2 px-2 md:px-0">
                    {navItems.map((item) => (
                        <li key={item.to} className="flex-1 md:flex-none">
                            <NavLink
                                to={item.to}
                                onClick={item.onClick}
                                className={({ isActive }) =>
                                    [
                                        "group flex md:items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 mx-0 md:mx-2 rounded-xl transition flex-col md:flex-row items-center",
                                        isActive && !item.onClick
                                            ? "bg-gray-900 text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    ].join(" ")
                                }
                            >
                                <span
                                    className="flex items-center justify-center"
                                    aria-hidden="true"
                                >
                                    {item.icon}
                                </span>
                                <span className="text-xs md:text-sm font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}