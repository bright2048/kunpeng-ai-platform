import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Menu, X, User, CreditCard, Bell, FileText, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
        // TODO: 从后端获取未读消息数
        setUnreadCount(42);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setLocation("/");
  };

  const navigation = [
    { name: "首页", href: "/" },
    { name: "核心能力", href: "/services/core" },
    { name: "空间支持", href: "/space-booking" },
    { name: "硬件供给", href: "/services/hardware" },
    { name: "软件支撑", href: "/services/software" },
    { name: "模型服务", href: "/services/model" },
    { name: "数据服务", href: "/services/data" },
    { name: "算力保障", href: "/services/computerpow" },
    { name: "赋能行业", href: "/industries" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="text-sm"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side: User Menu or Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent">
                      <span>{user.name || user.email}</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 px-1.5 py-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name || "用户"}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setLocation("/account")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>账号中心</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => setLocation("/billing")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>费用中心</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => setLocation("/notifications")}>
                    <Bell className="mr-2 h-4 w-4" />
                    <div className="flex items-center justify-between flex-1">
                      <span>未读消息</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={() => setLocation("/tickets")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>工单管理</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  注册/登录
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            
            {/* Mobile User Menu */}
            {user ? (
              <>
                <div className="border-t border-border my-2 pt-2">
                  <div className="px-3 py-2 text-sm font-semibold">
                    {user.name || user.email}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation("/account");
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  账号中心
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation("/billing");
                    setMobileMenuOpen(false);
                  }}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  费用中心
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation("/notifications");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  未读消息
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setLocation("/tickets");
                    setMobileMenuOpen(false);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  工单管理
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  注册/登录
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
