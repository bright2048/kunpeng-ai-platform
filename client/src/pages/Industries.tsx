import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  BookOpen,
  Building,
  Car,
  GraduationCap,
  Heart,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

export default function Industries() {
  const industries = [
    {
      icon: TrendingUp,
      title: "金融AI企业",
      description: "为金融行业提供智能投顾、风控、客服等AI解决方案",
      gradient: "from-blue-500 to-cyan-500",
      services: [
        "智能投顾服务",
        "风险控制与欺诈检测",
        "自动化客户服务",
        "信用评分与贷款审批",
      ],
      examples: "如Wealthfront智能投顾平台、PayPal欺诈检测系统、Capital One的Eno客服",
    },
    {
      icon: Heart,
      title: "医疗AI企业",
      description: "助力医疗行业实现智能诊断、药物研发、患者监护",
      gradient: "from-red-500 to-pink-500",
      services: [
        "智能诊断系统",
        "药物研发加速",
        "患者监护与管理",
        "医疗影像分析",
      ],
      examples: "利用深度学习技术辅助医生快速准确地诊断疾病，缩短新药上市时间",
    },
    {
      icon: Building,
      title: "制造AI企业",
      description: "通过AI技术优化生产流程，提高制造业效率",
      gradient: "from-orange-500 to-red-500",
      services: [
        "智能生产流程优化",
        "预测性维护",
        "供应链管理",
        "质量控制",
      ],
      examples: "实时监控和优化生产流程，预测设备故障，降低维护成本",
    },
    {
      icon: GraduationCap,
      title: "教育AI企业",
      description: "为教育行业提供个性化学习、智能评估等服务",
      gradient: "from-green-500 to-emerald-500",
      services: [
        "个性化学习路径设计",
        "智能评估与反馈系统",
        "虚拟助教与答疑",
        "学习数据分析",
      ],
      examples: "利用AI技术分析学生学习数据，为每个学生定制个性化的学习路径",
    },
    {
      icon: ShoppingBag,
      title: "零售AI企业",
      description: "帮助零售企业实现智能库存、个性化推荐、无人零售",
      gradient: "from-purple-500 to-pink-500",
      services: [
        "智能库存管理",
        "个性化购物体验",
        "无人零售技术",
        "需求预测",
      ],
      examples: "利用AI技术进行库存预测和管理，提供个性化推荐，提高零售效率",
    },
    {
      icon: Car,
      title: "交通AI企业",
      description: "为交通行业提供智能交通系统、自动驾驶等解决方案",
      gradient: "from-indigo-500 to-blue-500",
      services: [
        "智能交通系统",
        "车辆安全监控",
        "智能物流配送",
        "自动驾驶技术",
      ],
      examples: "如谷歌Waymo自动驾驶技术、特斯拉Autopilot系统、亚马逊无人机配送",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">六大重点赋能行业</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">赋能行业AI企业</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              为金融、医疗、制造、教育、零售、交通等行业的AI企业提供全方位支持，
              助力行业智能化转型升级
            </p>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 max-w-6xl mx-auto">
            {industries.map((industry, index) => {
              const Icon = industry.icon;
              return (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{industry.title}</CardTitle>
                        <CardDescription className="text-base">{industry.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">核心服务：</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {industry.services.map((service, serviceIndex) => (
                          <div key={serviceIndex} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${industry.gradient}`} />
                            <span className="text-sm">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">应用案例：</span>
                        {industry.examples}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              我们的成果
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <div className="text-sm text-muted-foreground">服务企业</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  6
                </div>
                <div className="text-sm text-muted-foreground">重点行业</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <div className="text-sm text-muted-foreground">成功案例</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  95%
                </div>
                <div className="text-sm text-muted-foreground">客户满意度</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                您的行业准备好AI转型了吗？
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                无论您来自哪个行业，我们都有专业的团队和丰富的经验为您提供定制化的AI解决方案
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                立即咨询 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
