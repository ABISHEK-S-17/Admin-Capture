import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  Calendar,
  Image,
  Info,
  CreditCard,
  Briefcase,
  Folder,
  LayoutGrid,
  Users,
  Settings,
  DollarSign,
  Phone,
  FileText,
  MessageSquare,
} from "lucide-react";

const Sidebar = () => {
  const { pathname } = useLocation();

  const menu = [
    { name: "Dashboard", path: "", icon: LayoutGrid }, 
    { name: "Category", path: "category", icon: Layers },
    { name: "Event", path: "event", icon: Calendar },
    { name: "Banner", path: "banner", icon: Image },
    { name: "About", path: "about", icon: Info },
    { name: "Card", path: "card", icon: CreditCard },
    { name: "Service", path: "service", icon: Briefcase },
    { name: "Portfolio", path: "portfolio", icon: Folder },
    { name: "Team", path: "team", icon: Users },
    { name: "Process", path: "process", icon: Settings },
    { name: "Price", path: "price", icon: DollarSign },
    { name: "Contact", path: "contact", icon: Phone },
    { name: "Blog", path: "blog", icon: FileText },
    { name: "Testimonial", path: "testimonial", icon: MessageSquare },
    { name: "Logo", path: "logo", icon: Image },  
  ];

  const isActive = (module) => {
    if (module === "") return pathname === "/";
    return (
      pathname === `/${module}` ||
      pathname.startsWith(`/create-${module}`) ||
      pathname.startsWith(`/edit-${module}`)
    );
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="sticky top-0 z-50 h-20 flex items-center px-6 border-b">
        <Link to="/" className="text-2xl font-semibold text-gray-800">
          Admin Panel
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.name}
              to={`/${item.path}`}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all
                ${active
                  ? "bg-gray-300 text-black"
                  : "text-gray-700 hover:bg-gray-200"
                }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
