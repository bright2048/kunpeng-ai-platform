import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
  TrendingUp,
  Filter,
} from "lucide-react";

// GPU 配置数据类型
interface GPUConfig {
  id: string;
  model: string;
  vendor: string;
  price: number;
  priceUnit: string;
  vram: number;
  cardCount: number;
  cpu: number;
  memory: number;
  storage: number;
  stock: number;
  region: string;
  rentalType: string;
  billingCycle: string;
  isHot?: boolean;
  isSpecial?: boolean;
}

export default function ComputingPower() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  // 筛选条件
  const [rentalType, setRentalType] = useState("online"); // 租用方案
  const [billingCycle, setBillingCycle] = useState("hourly"); // 计费周期
  const [region, setRegion] = useState("华东一区"); // 区域
  const [selectedGPU, setSelectedGPU] = useState("all"); // GPU型号
  const [sortBy, setSortBy] = useState("price-asc"); // 排序方式

  // 模拟GPU数据
  const [gpuList, setGpuList] = useState<GPUConfig[]>([
    {
      id: "1",
      model: "RTX 4090",
      vendor: "NVIDIA",
      price: 1.8,
      priceUnit: "小时",
      vram: 24,
      cardCount: 1,
      cpu: 12,
      memory: 60,
      storage: 160,
      stock: 16,
      region: "华东一区",
      rentalType: "online",
      billingCycle: "hourly",
      isHot: true,
    },
    {
      id: "2",
      model: "RTX 4090",
      vendor: "NVIDIA",
      price: 3.6,
      priceUnit: "小时",
      vram: 24,
      cardCount: 2,
      cpu: 24,
      memory: 120,
      storage: 260,
      stock: 8,
      region: "华东一区",
      rentalType: "online",
      billingCycle: "hourly",
    },
    {
      id: "3",
      model: "RTX 4090",
      vendor: "NVIDIA",
      price: 7.2,
      priceUnit: "小时",
      vram: 24,
      cardCount: 4,
      cpu: 48,
      memory: 240,
      storage: 460,
      stock: 0,
      region: "华东一区",
      rentalType: "online",
      billingCycle: "hourly",
    },
    {
      id: "4",
      model: "RTX 5090",
      vendor: "NVIDIA",
      price: 2.5,
      priceUnit: "小时",
      vram: 32,
      cardCount: 1,
      cpu: 16,
      memory: 64,
      storage: 200,
      stock: 12,
      region: "华东一区",
      rentalType: "online",
      billingCycle: "hourly",
      isHot: true,
      isSpecial: true,
    },
    {
      id: "5",
      model: "L40",
      vendor: "NVIDIA",
      price: 3.2,
      priceUnit: "小时",
      vram: 48,
      cardCount: 1,
      cpu: 16,
      memory: 128,
      storage: 500,
      stock: 6,
      region: "华南一区",
      rentalType: "online",
      billingCycle: "hourly",
    },
    {
      id: "6",
      model: "A100",
      vendor: "NVIDIA",
      price: 8.5,
      priceUnit: "小时",
      vram: 80,
      cardCount: 1,
      cpu: 32,
      memory: 256,
      storage: 1000,
      stock: 4,
      region: "华北一区",
      rentalType: "online",
      billingCycle: "hourly",
    },
    {
      id: "7",
      model: "H100",
      vendor: "NVIDIA",
      price: 15.0,
      priceUnit: "小时",
      vram: 80,
      cardCount: 1,
      cpu: 32,
      memory: 512,
      storage: 2000,
      stock: 2,
      region: "华北一区",
      rentalType: "online",
      billingCycle: "hourly",
      isSpecial: true,
    },
    {
      id: "8",
      model: "A800",
      vendor: "NVIDIA",
      price: 7.8,
      priceUnit: "小时",
      vram: 80,
      cardCount: 1,
      cpu: 32,
      memory: 256,
      storage: 1000,
      stock: 5,
      region: "华中一区",
      rentalType: "online",
      billingCycle: "hourly",
    },
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  }, []);

  // 租用方案选项
  const rentalTypes = [
    { value: "online", label: "线上租用" },
    { value: "bare-metal", label: "线下裸金属" },
    { value: "cluster", label: "集群租用" },
    { value: "edge", label: "边缘计算" },
    { value: "dedicated", label: "专属资源池" },
  ];

  // 计费周期选项
  const billingCycles = [
    { value: "hourly", label: "按量计费", unit: "小时" },
    { value: "daily", label: "按天计费", unit: "天" },
    { value: "monthly", label: "按月计费", unit: "月" },
    { value: "quarterly", label: "按季度计费", unit: "季度" },
    { value: "yearly", label: "按年计费", unit: "年" },
  ];

  // 区域选项
  const regions = [
    "华东一区", "华东二区", "华东三区", "华东四区",
    "华南一区", "华南二区", "华南三区", "华南四区",
    "华北一区", "华北二区", "华北三区", "华北四区",
    "华中一区", "华中二区", "华中三区", "华中四区",
    "西北一区", "西北二区", "西北三区", "西北四区",
  ];

  // GPU型号选项
  const gpuModels = [
    { value: "all", label: "全部型号" },
    { value: "4090", label: "RTX 4090", isHot: true },
    { value: "5090", label: "RTX 5090", isHot: true },
    { value: "L40", label: "L40" },
    { value: "A100", label: "A100" },
    { value: "A800", label: "A800" },
    { value: "H100", label: "H100", isSpecial: true },
  ];

  // 筛选GPU列表
  const filteredGPUs = gpuList.filter((gpu) => {
    if (selectedGPU !== "all" && !gpu.model.includes(selectedGPU)) return false;
    if (gpu.region !== region) return false;
    if (gpu.rentalType !== rentalType) return false;
    return true;
  });

  // 排序
  const sortedGPUs = [...filteredGPUs].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "vram-desc":
        return b.vram - a.vram;
      case "performance":
        return b.vram * b.cardCount - a.vram * a.cardCount;
      default:
        return 0;
    }
  });

  // 处理租用
  const handleRent = (gpu: GPUConfig) => {
    // 检查登录状态
    if (!user) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    // 检查实名认证状态（假设用户对象中有 verified 字段）
    if (!user.verified) {
      toast.error("请先完成实名认证");
      setLocation("/account?tab=verification");
      return;
    }

    // 检查库存
    if (gpu.stock === 0) {
      toast.error("该配置已租完");
      return;
    }

    // 跳转到订单确认页面
    toast.success(`正在为您准备 ${gpu.model} 订单...`);
    // setLocation(`/order/confirm?gpuId=${gpu.id}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        {/* 页面标题 */}
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold">算力保障</h1>
          </div>
          <p className="text-gray-400">
            提供弹性算力集群、GPU/TPU租赁、私有算力部署等全方位算力服务
          </p>
        </div>

        {/* 筛选器区域 */}
        <div className="bg-gray-800 border-y border-gray-700">
          <div className="container py-6 space-y-4">
            {/* 租用方案 */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-20">租用方案</label>
              <div className="flex gap-2 flex-wrap">
                {rentalTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={rentalType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRentalType(type.value)}
                    className={
                      rentalType === type.value
                        ? "bg-blue-600 hover:bg-blue-700"
                        : ""
                    }
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 计费周期 */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-20">计费周期</label>
              <div className="flex gap-2 flex-wrap">
                {billingCycles.map((cycle) => (
                  <Button
                    key={cycle.value}
                    variant={billingCycle === cycle.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBillingCycle(cycle.value)}
                    className={
                      billingCycle === cycle.value
                        ? "bg-purple-600 hover:bg-purple-700"
                        : ""
                    }
                  >
                    {cycle.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 区域和GPU型号 */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* 选择区域 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400 w-20">选择区域</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GPU型号 */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">GPU型号</label>
                <div className="flex gap-2 flex-wrap">
                  {gpuModels.map((model) => (
                    <Button
                      key={model.value}
                      variant={selectedGPU === model.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGPU(model.value)}
                      className={`relative ${
                        selectedGPU === model.value
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }`}
                    >
                      {model.label}
                      {model.isHot && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 px-1 py-0 text-xs"
                        >
                          热门
                        </Badge>
                      )}
                      {model.isSpecial && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 px-1 py-0 text-xs bg-orange-500"
                        >
                          特惠
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 排序 */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400 w-20">排序方式</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc">价格从低到高</SelectItem>
                  <SelectItem value="price-desc">价格从高到低</SelectItem>
                  <SelectItem value="vram-desc">显存从大到小</SelectItem>
                  <SelectItem value="performance">综合性能</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* GPU卡片列表 */}
        <div className="container py-8">
          {sortedGPUs.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无符合条件的GPU资源</p>
              <p className="text-gray-500 text-sm mt-2">
                请尝试调整筛选条件或选择其他区域
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedGPUs.map((gpu) => (
                <Card
                  key={gpu.id}
                  className="bg-gray-800 border-gray-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    {/* GPU型号和标签 */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {gpu.vendor} {gpu.model}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-1">
                        {gpu.isHot && (
                          <Badge variant="destructive" className="text-xs">
                            热门
                          </Badge>
                        )}
                        {gpu.isSpecial && (
                          <Badge className="text-xs bg-orange-500">特惠</Badge>
                        )}
                      </div>
                    </div>

                    {/* 价格 */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-orange-400 text-3xl font-bold">
                          ¥{gpu.price}
                        </span>
                        <span className="text-gray-400 text-sm">
                          /{gpu.priceUnit}
                        </span>
                      </div>
                    </div>

                    {/* 配置信息 */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MemoryStick className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">显存</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                          {gpu.vram} GB/卡
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-gray-400">卡数</span>
                        </div>
                        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                          {gpu.cardCount}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-gray-400">CPU</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                          {gpu.cpu} 核
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MemoryStick className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">内存</span>
                        </div>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                          {gpu.memory} GB
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-orange-400" />
                          <span className="text-sm text-gray-400">硬盘</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                          {gpu.storage} GB
                        </Badge>
                      </div>
                    </div>

                    {/* 租用按钮 */}
                    <Button
                      className={`w-full ${
                        gpu.stock > 0
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                      onClick={() => handleRent(gpu)}
                      disabled={gpu.stock === 0}
                    >
                      {gpu.stock > 0 ? `租用 ${gpu.stock}` : "已租完"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 统计信息 */}
          {sortedGPUs.length > 0 && (
            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>
                共找到 <span className="text-blue-400 font-semibold">{sortedGPUs.length}</span> 个GPU配置，
                可用库存 <span className="text-green-400 font-semibold">
                  {sortedGPUs.reduce((sum, gpu) => sum + gpu.stock, 0)}
                </span> 台
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
