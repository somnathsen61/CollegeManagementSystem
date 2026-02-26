import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    // Define menu items based on Role
    const menuItems = {
        Admin: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "Register User", path: "/register-user" }, // <--- NEW LINE
            { name: "Assign Subjects", path: "/allocate-subject" },
            { name: "Generate Marksheets", path: "/generate-marksheets" },
        ],
        Teacher: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "My Classes", path: "/my-classes" },
            { name: "Gradebook", path: "/gradebook" },
        ],
        Student: [
            { name: "Dashboard", path: "/dashboard" },
            { name: "My Profile", path: "/profile" },
            { name: "My Grades", path: "/grades" },
        ]
    };

    const currentMenu = menuItems[role] || [];
    const userName = localStorage.getItem("userName") || "User";
    const userInitial = userName.charAt(0).toUpperCase();


    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-800 text-white shadow-lg">
                <div className="p-6 text-center text-2xl font-bold tracking-wider border-b border-slate-700">
                    IIEST Portal
                </div>
                <nav className="mt-6 flex flex-col gap-2 px-4">
                    {currentMenu.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`rounded-md px-4 py-3 transition-colors ${location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="mt-8 w-full rounded-md border border-red-500 py-2 text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* TOP HEADER */}
                <header className="flex h-16 items-center justify-between bg-white px-8 shadow-sm border-b border-gray-200">
                    <h2 className="text-xl font-bold text-slate-700 tracking-tight">
                        {role} Portal
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="block text-sm font-semibold text-gray-700">Welcome, {userName}</span>
                            <span className="block text-xs text-gray-500">{role}</span>
                        </div>

                        {/* Improved Avatar / Logo */}
                        <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-indigo-100">
                            {userInitial}
                        </div>
                    </div>
                </header>

                {/* DYNAMIC PAGE CONTENT */}
                <main className="flex-1 overflow-auto p-8">
                    <Outlet /> {/* This is where the page content will appear */}
                </main>
            </div>
        </div>
    );
}