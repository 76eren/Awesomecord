import {NavLink} from "react-router-dom";
import {Bell, ContactRound, LogOut, MessageSquare, UserIcon} from "lucide-react";
import * as React from "react";
import {logout} from "../../services/authService";
import {useUserStore} from "../../store/userStore.ts";

type NavItem = {
    to: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
};

const navItems: NavItem[] = [
    {to: "/notifications", label: "Notifications", icon: <Bell className="h-5 w-5"/>},
    {to: "/chats", label: "Chats", icon: <MessageSquare className="h-5 w-5"/>},
    // {to: "/servers", label: "Servers", icon: <ServerIcon className="h-5 w-5"/>},
    {to: "/add-friend", label: "Friends", icon: <ContactRound className="h-5 w-5"/>},
    {to: "/profile", label: "Profile", icon: <UserIcon className="h-5 w-5"/>},
    {
        to: "#",
        label: "Logout",
        icon: <LogOut className="h-5 w-5"/>,
        onClick: () => logout().then(() => {
            window.location.href = "/login";
        }),
    },
];

const MIN_WIDTH = 192;
const MAX_WIDTH = 300;
const DEFAULT_WIDTH = 224;
const STORAGE_KEY = "sidebarWidthPx";

export default function Navbar() {
    const user = useUserStore((s) => s.user);

    const [width, setWidth] = React.useState<number>(() => {
        const stored = Number(localStorage.getItem(STORAGE_KEY));
        if (Number.isFinite(stored) && stored >= MIN_WIDTH && stored <= MAX_WIDTH) return stored;
        return DEFAULT_WIDTH;
    });
    const [dragging, setDragging] = React.useState(false);

    const startDrag = (clientX: number) => {
        setDragging(true);

        const onMove = (e: MouseEvent | TouchEvent) => {
            let x: number;
            if (e instanceof TouchEvent) {
                x = e.touches[0]?.clientX ?? 0;
            } else {
                x = (e as MouseEvent).clientX;
            }

            const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, x));
            setWidth(next);
        };
        const onUp = () => {
            setDragging(false);
            localStorage.setItem(STORAGE_KEY, String(widthRef.current));
            window.removeEventListener("mousemove", onMove as any);
            window.removeEventListener("mouseup", onUp);
            window.removeEventListener("touchmove", onMove as any);
            window.removeEventListener("touchend", onUp);
            window.removeEventListener("touchcancel", onUp);

            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        };

        document.body.style.userSelect = "none";
        document.body.style.cursor = "col-resize";

        window.addEventListener("mousemove", onMove as any);
        window.addEventListener("mouseup", onUp);
        window.addEventListener("touchmove", onMove as any, {passive: false});
        window.addEventListener("touchend", onUp);
        window.addEventListener("touchcancel", onUp);
    };

    const widthRef = React.useRef(width);
    React.useEffect(() => {
        widthRef.current = width;
    }, [width]);

    return (
        <aside
            style={{["--sidebar-width" as any]: `${width}px`}}
            className="
        md:sticky md:top-0 md:h-screen bg-white border-r md:border-gray-700
        fixed bottom-0 w-full border-t border-gray-700 md:border-t-0 z-50
        md:w-[var(--sidebar-width)]
      "
        >
            <div className="px-4 py-5 border-b border-gray-200 md:block hidden">
                <div className="text-xl font-semibold tracking-tight">Awesomecord!</div>
                {user != null && <div className="text-xs text-gray-500">Welcome: @{user.userHandle}</div>}
            </div>

            <nav className="py-4 md:py-4">
                <ul className="flex md:flex-col justify-around md:space-y-1 md:space-x-0 space-x-2 px-2 md:px-0">
                    {navItems.map((item) => (
                        <li key={item.to} className="flex-1 md:flex-none">
                            <NavLink
                                to={item.to}
                                onClick={item.onClick}
                                className={({isActive}) =>
                                    [
                                        "group flex md:items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-2.5 mx-0 md:mx-2 rounded-xl transition flex-col md:flex-row items-center",
                                        isActive && !item.onClick ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
                                    ].join(" ")
                                }
                            >
                <span className="flex items-center justify-center" aria-hidden="true">
                  {item.icon}
                </span>
                                <span className="text-xs md:text-sm font-medium">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div
                className="
          hidden md:block absolute top-0 right-0 h-full w-1 cursor-col-resize
          bg-transparent select-none
        "
                onMouseDown={(e) => startDrag(e.clientX)}
                onTouchStart={(e) => {
                    const x = e.touches[0]?.clientX ?? 0;
                    startDrag(x);
                }}

                style={{position: "absolute"}}
            >
                <div className="absolute inset-y-0 -left-1 w-2"/>
                <div className="absolute inset-y-0 left-0 w-px bg-gray-200"/>
            </div>

            {dragging && (
                <div
                    className="hidden md:block fixed inset-0 cursor-col-resize"
                    style={{zIndex: 60}}
                    onTouchMove={(e) => e.preventDefault()}
                />
            )}
        </aside>
    );
}
