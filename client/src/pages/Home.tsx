import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  Building2,
  Cpu,
  Database,
  FileCode,
  Network,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const services = [
    {
      icon: Sparkles,
      title: "平台核心能力",
      description: "技术开发支持、市场拓展辅导、人才培养计划",
      href: "/services/core",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Building2,
      title: "空间支持",
      description: "专属办公区、联合实验室、测试验证场地",
      href: "/space-booking",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Cpu,
      title: "硬件供给",
      description: "鲲鹏芯片服务器、AI加速卡、边缘计算设备",
      href: "/services/hardware",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FileCode,
      title: "软件支撑",
      description: "鲲鹏操作系统、AI开发工具链、数据管理平台",
      href: "/services/software",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Network,
      title: "模型服务",
      description: "通用AI模型、训练框架、优化工具、定制开发",
      href: "/services/model",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Database,
      title: "数据服务",
      description: "合规数据集、清洗标注工具、安全加密方案",
      href: "/services/data",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Server,
      title: "算力保障",
      description: "弹性算力集群、GPU/TPU租赁、私有算力部署",
      href: "/services/computing",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "赋能行业",
      description: "金融、医疗、制造、教育、零售、交通AI企业",
      href: "/industries",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  const stats = [
    { value: "500+", label: "服务企业" },
    { value: "1000+", label: "AI模型" },
    { value: "10PB+", label: "数据资源" },
    { value: "99.9%", label: "服务可用性" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xl md:text-2xl text-muted-foreground">AI企业全栈式赋能平台</span>
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              为AI企业提供空间、硬件、软件、模型、数据、算力等全方位支持，助力企业快速构建智能应用，加速AI产业创新发展
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                开始使用
              </Button>
              <Button size="lg" variant="outline">
                了解更多
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">八大核心服务</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              提供从空间到算力的全栈式服务，满足AI企业在不同发展阶段的需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Link key={index} href={service.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                准备好加速您的AI创新了吗？
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                立即联系我们，了解如何通过鲲鹏产业源头创新中心的全栈式服务，
                加速您的AI项目落地
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                联系我们
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
