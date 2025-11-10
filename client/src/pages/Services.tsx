import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  FileCode,
  Network,
  Server,
  Sparkles,
} from "lucide-react";
import { useRoute } from "wouter";

interface ServiceContent {
  title: string;
  description: string;
  icon: any;
  gradient: string;
  features: Array<{
    title: string;
    description: string;
    items: string[];
  }>;
}

const serviceData: Record<string, ServiceContent> = {
  core: {
    title: "平台核心能力矩阵",
    description: "提供AI算法开发、数据处理等技术支持，助力企业快速构建智能应用",
    icon: Sparkles,
    gradient: "from-blue-500 to-cyan-500",
    features: [
      {
        title: "技术开发支持",
        description: "提供AI算法开发、数据处理等技术支持，助力企业快速构建智能应用",
        items: ["定制化AI解决方案", "数据处理与分析", "AI技术培训与教育"],
      },
      {
        title: "市场拓展辅导",
        description: "通过市场分析、品牌建设等辅导，帮助企业拓展AI产品市场，提升竞争力",
        items: ["市场趋势分析", "品牌建设指导", "商业策略咨询"],
      },
      {
        title: "人才培养计划",
        description: "开展AI领域专业培训，为企业输送具备实战能力的AI技术人才",
        items: ["专业技能培训", "实战项目演练", "人才推荐服务"],
      },
    ],
  },
  space: {
    title: "空间支持",
    description: "提供定制化办公空间、联合实验室、测试验证场地等物理空间支持",
    icon: Building2,
    gradient: "from-purple-500 to-pink-500",
    features: [
      {
        title: "AI企业专属办公区",
        description: "根据AI企业的特定需求，提供定制化的办公空间设计",
        items: ["定制化办公空间", "高速网络与数据安全", "智能办公设备"],
      },
      {
        title: "联合实验室",
        description: "提供先进的AI研发设备，供入驻企业共同使用，降低研发成本",
        items: ["共享研发资源", "跨领域合作平台", "人才培养与交流"],
      },
      {
        title: "测试验证场地",
        description: "提供多种模拟真实场景的测试场地，如智能家居、智慧城市等",
        items: ["模拟真实环境", "高性能计算资源", "跨领域合作平台"],
      },
      {
        title: "产业交流会议室",
        description: "配备先进的视频会议系统和智能演示工具，便于远程协作和高效沟通",
        items: ["多功能布局设计", "高科技会议设备", "舒适环境营造"],
      },
    ],
  },
  hardware: {
    title: "硬件供给",
    description: "提供鲲鹏芯片服务器、AI加速卡、边缘计算设备等硬件资源",
    icon: Cpu,
    gradient: "from-orange-500 to-red-500",
    features: [
      {
        title: "鲲鹏芯片服务器",
        description: "采用华为自主研发的鲲鹏芯片，实现自主可控的硬件平台",
        items: ["高性能计算能力", "自主研发芯片技术", "优化的能效比"],
      },
      {
        title: "AI加速卡",
        description: "专为人工智能计算任务设计的硬件加速器，显著提升AI模型训练和推理速度",
        items: ["NVIDIA Tensor Core GPU", "Google TPU", "高性能并行计算"],
      },
      {
        title: "边缘计算设备",
        description: "提供高性能计算节点，为AI应用提供实时数据处理能力",
        items: ["低延迟数据处理", "高性能计算节点", "分布式存储解决方案"],
      },
      {
        title: "传感器",
        description: "提供温度、压力、图像等各类传感器，用于实时数据采集",
        items: ["多种传感器类型", "实时数据采集", "智能化微型化"],
      },
    ],
  },
  software: {
    title: "软件支撑",
    description: "提供鲲鹏操作系统、AI开发工具链、数据管理平台等软件支持",
    icon: FileCode,
    gradient: "from-green-500 to-emerald-500",
    features: [
      {
        title: "鲲鹏操作系统",
        description: "采用自主开发的内核，确保了系统的安全性和可控性",
        items: ["自主可控的内核技术", "高效的数据处理能力", "全面的云服务支持"],
      },
      {
        title: "AI开发工具链",
        description: "提供完整的AI开发工具链，包括IDE、版本控制、自动化测试等",
        items: ["集成开发环境(PyCharm、Jupyter)", "版本控制系统(Git)", "自动化测试框架"],
      },
      {
        title: "数据管理平台",
        description: "提供高效的数据集成工具，支持实时数据处理和分析",
        items: ["数据集成与处理", "数据存储解决方案", "数据安全与合规"],
      },
      {
        title: "中间件",
        description: "提供消息队列、服务网格等中间件，提升系统稳定性和扩展性",
        items: ["数据处理中间件(Kafka)", "消息队列中间件(RabbitMQ)", "服务网格中间件(Istio)"],
      },
    ],
  },
  model: {
    title: "模型服务",
    description: "提供行业通用AI模型、训练框架、优化工具、定制化开发服务",
    icon: Network,
    gradient: "from-indigo-500 to-blue-500",
    features: [
      {
        title: "行业通用AI模型",
        description: "提供自然语言处理、计算机视觉、推荐系统等通用AI模型",
        items: ["自然语言处理模型(BERT、GPT)", "计算机视觉模型(ResNet、YOLO)", "推荐系统模型"],
      },
      {
        title: "模型训练框架",
        description: "利用分布式计算资源，实现大规模数据集的快速处理和模型训练",
        items: ["分布式计算支持", "自动化模型调优", "实时监控与反馈"],
      },
      {
        title: "模型优化工具",
        description: "通过剪枝、量化等技术减少模型大小，提升推理速度",
        items: ["模型压缩技术", "超参数调优", "模型蒸馏"],
      },
      {
        title: "定制化开发服务",
        description: "针对企业特定需求，提供一对一的需求分析和定制化开发",
        items: ["需求分析与定制", "模型训练与优化", "集成与部署支持"],
      },
    ],
  },
  data: {
    title: "数据服务",
    description: "提供合规行业数据集、清洗标注工具、安全加密方案、数据共享平台",
    icon: Database,
    gradient: "from-yellow-500 to-orange-500",
    features: [
      {
        title: "合规行业数据集",
        description: "确保数据集符合行业标准和法律法规，如GDPR或CCPA",
        items: ["数据集的合规性要求", "数据集的行业特定性", "数据集的更新与维护"],
      },
      {
        title: "数据清洗与标注工具",
        description: "提供自动化数据清洗和智能数据标注平台，提高数据质量",
        items: ["自动化数据清洗(Trifacta)", "智能数据标注平台(Labelbox、V7)", "数据质量监控工具"],
      },
      {
        title: "数据安全加密方案",
        description: "采用端到端加密技术，确保数据在传输过程中不被第三方截获或篡改",
        items: ["端到端加密技术", "数据脱敏处理", "区块链数据保护"],
      },
      {
        title: "数据共享与流通",
        description: "提供数据交换平台，促进企业间数据安全、高效流通",
        items: ["数据交换平台", "数据隐私保护", "数据价值挖掘"],
      },
    ],
  },
  computing: {
    title: "算力保障",
    description: "提供弹性算力集群、GPU/TPU租赁、私有算力部署、算力调度监控",
    icon: Server,
    gradient: "from-teal-500 to-cyan-500",
    features: [
      {
        title: "弹性算力集群",
        description: "根据AI企业需求，弹性算力集群能够实时调整计算资源",
        items: ["动态资源分配", "智能负载均衡", "故障自愈机制"],
      },
      {
        title: "GPU/TPU算力租赁",
        description: "企业可根据需求灵活租用GPU/TPU资源，实现成本优化",
        items: ["弹性计算资源", "高性能计算支持", "按需付费模式"],
      },
      {
        title: "私有算力部署",
        description: "根据企业需求定制服务器硬件，如GPU、TPU等",
        items: ["定制化硬件配置", "私有云数据中心", "专属网络架构"],
      },
      {
        title: "算力调度与监控系统",
        description: "通过实时监控系统负载，动态调整计算资源，确保AI任务高效运行",
        items: ["动态资源分配", "智能故障预测", "实时性能监控"],
      },
    ],
  },
};

export default function Services() {
  const [, params] = useRoute("/services/:category");
  const category = params?.category || "core";
  const service = serviceData[category] || serviceData.core;
  const Icon = service.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mx-auto mb-6`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.title}</h1>
            <p className="text-xl text-muted-foreground">{service.description}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 max-w-6xl mx-auto">
            {service.features.map((feature, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {feature.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle2 className={`h-5 w-5 mt-0.5 flex-shrink-0 bg-gradient-to-br ${service.gradient} bg-clip-text text-transparent`} />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <Card className={`bg-gradient-to-r ${service.gradient} border-0 text-white`}>
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                了解更多关于{service.title}的信息
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                我们的专业团队随时准备为您提供咨询服务，帮助您选择最适合的解决方案
              </p>
              <Button size="lg" variant="secondary" className="bg-white hover:bg-gray-100">
                联系我们 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
