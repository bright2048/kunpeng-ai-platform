import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { Cpu, HardDrive, Users, ArrowRight, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 检查用户登录状态和权限
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      
      // 检查是否是管理员（支持 role 或 is_admin 字段）
      const isAdmin = userData.role === 'admin' || 
                     userData.role === 'super_admin' || 
                     userData.is_admin === true;
      
      if (!isAdmin) {
        toast.error("您没有权限访问此页面");
        setLocation("/");
        return;
      }

      setUser(userData);
    } catch (e) {
      console.error("Failed to parse user data:", e);
      toast.error("用户信息错误");
      setLocation("/login");
    }
  }, []);

  const adminModules = [
    {
      title: "用户管理",
      description: "管理系统用户和权限",
      icon: Users,
      path: "/admin/users",
      gradient: "from-blue-600 to-blue-800",
      detail: "查看用户列表"
    },
    {
      title: "GPU管理",
      description: "管理GPU资源和配置",
      icon: Cpu,
      path: "/admin/gpu",
      gradient: "from-purple-600 to-purple-800",
      detail: "查看GPU资源"
    },
    {
      title: "硬件管理",
      description: "管理硬件产品和库存",
      icon: HardDrive,
      path: "/admin/hardware",
      gradient: "from-green-600 to-green-800",
      detail: "查看硬件产品"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="container py-12">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-10 h-10 text-blue-400" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  管理中心
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                欢迎回来，{user?.name || user?.email || '管理员'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                系统管理和配置中心
              </p>
            </div>
          </div>

          {/* 管理模块卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.path}
                  className={`bg-gradient-to-br ${module.gradient} border-0 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl group`}
                  onClick={() => setLocation(module.path)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                      <ArrowRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-white text-2xl">
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-white/80 text-base">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-white/90">
                      <span className="text-sm font-medium">{module.detail}</span>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 快捷信息 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">当前角色</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-400">
                  {user?.role === 'super_admin' ? '超级管理员' : '管理员'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">登录账号</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-400">
                  {user?.email || '未知'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">管理模块</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-400">
                  {adminModules.length} 个
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
