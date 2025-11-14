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
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// GPU 配置数据类型
interface GPUConfig {
  id: number;
  model: string;
  vendor: string;
  price: number;
  price_unit: string;
  vram: number;
  card_count: number;
  cpu: number;
  memory: number;
  storage: number;
  stock: number;
  region: string;
  rental_type: string;
  billing_cycle: string;
  is_hot?: boolean;
  is_special?: boolean;
  status: string;
  description?: string;
}

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 每页显示数量
const ITEMS_PER_PAGE = 40;

export default function ComputingPower() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 筛选条件
  const [rentalType, setRentalType] = useState("all"); // 租用方案
  const [billingCycle, setBillingCycle] = useState("all"); // 计费周期
  const [region, setRegion] = useState("全部"); // 区域
  const [selectedGPU, setSelectedGPU] = useState("all"); // GPU型号
  const [sortBy, setSortBy] = useState("price-asc"); // 排序方式

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);

  // GPU列表数据（从API加载）
  const [gpuList, setGpuList] = useState<GPUConfig[]>([]);
  const [filteredGPUs, setFilteredGPUs] = useState<GPUConfig[]>([]);
  const [paginatedGPUs, setPaginatedGPUs] = useState<GPUConfig[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }

    // 加载GPU资源数据
    fetchGPUResources();
  }, []);

  // 从API获取GPU资源
  const fetchGPUResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gpu/resources?status=active`);
      const data = await response.json();

      if (data.success) {
        setGpuList(data.data);
      } else {
        toast.error('加载GPU资源失败');
      }
    } catch (error) {
      console.error('获取GPU资源失败:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 筛选和排序GPU列表
  useEffect(() => {
    let filtered = gpuList.filter((gpu) => {
      if (selectedGPU !== "all" && !gpu.model.includes(selectedGPU)) return false;
      if (region !== "全部" && gpu.region !== region) return false;
      if (rentalType !== "all" && gpu.rental_type !== rentalType) return false;
      if (billingCycle !== "all" && gpu.billing_cycle !== billingCycle) return false;
      return true;
    });

    // 排序
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "vram-desc":
          return b.vram - a.vram;
        case "performance":
          return b.vram * b.card_count - a.vram * a.card_count;
        default:
          return 0;
      }
    });

    setFilteredGPUs(filtered);
    setCurrentPage(1); // 重置到第一页
  }, [gpuList, selectedGPU, region, rentalType, billingCycle, sortBy]);

  // 分页处理
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedGPUs(filteredGPUs.slice(startIndex, endIndex));
  }, [filteredGPUs, currentPage]);

  // 计算总页数
  const totalPages = Math.ceil(filteredGPUs.length / ITEMS_PER_PAGE);

  // 租用方案选项
  const rentalTypes = [
    { value: "all", label: "全部" },
    { value: "online", label: "线上租用" },
    { value: "bare-metal", label: "线下裸金属" },
    { value: "cluster", label: "集群租用" },
    { value: "edge", label: "边缘计算" },
    { value: "dedicated", label: "专属资源池" },
  ];

  // 计费周期选项
  const billingCycles = [
    { value: "all", label: "全部", unit: "" },
    { value: "hourly", label: "按量计费", unit: "小时" },
    { value: "daily", label: "按天计费", unit: "天" },
    { value: "monthly", label: "按月计费", unit: "月" },
    { value: "quarterly", label: "按季度计费", unit: "季度" },
    { value: "yearly", label: "按年计费", unit: "年" },
  ];

  // 区域选项
  const regions = [
    "全部",
    "华东一区", "华东二区", "华东三区",
    "华南一区", "华南二区",
    "华北一区", "华北二区",
    "华中一区", "华中二区",
    "西北一区",
  ];

  // GPU型号选项（从数据中动态生成）
  const gpuModels = [
    { value: "all", label: "全部型号" },
    ...Array.from(new Set(gpuList.map(gpu => gpu.model)))
      .map(model => ({
        value: model,
        label: model,
        isHot: gpuList.some(gpu => gpu.model === model && gpu.is_hot),
        isSpecial: gpuList.some(gpu => gpu.model === model && gpu.is_special),
      }))
  ];

  // 处理租用
  const handleRent = (gpu: GPUConfig) => {
    // 检查登录状态
    if (!user) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    // 检查实名认证状态
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

  // 分页控制
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "text-gray-300"
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
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "text-gray-300"
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
                      className={`relative ${selectedGPU === model.value
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "text-gray-300"
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

            {/* 结果统计 */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                共找到 <span className="text-blue-400 font-semibold">{filteredGPUs.length}</span> 个GPU资源
                {totalPages > 1 && (
                  <span className="ml-2">
                    (第 {currentPage}/{totalPages} 页)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* GPU卡片列表 */}
        <div className="container py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
              <p className="text-gray-400">加载GPU资源中...</p>
            </div>
          ) : filteredGPUs.length === 0 ? (
            <div className="text-center py-20">
              <Filter className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无符合条件的GPU资源</p>
              <p className="text-gray-500 text-sm mt-2">
                请尝试调整筛选条件或选择其他区域
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedGPUs.map((gpu) => (
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
                        {/* 只在有热门或特惠标签时才显示容器 */}
                        {(!!gpu.is_hot || !!gpu.is_special) && (
                          <div className="flex flex-col gap-1">
                            {!!gpu.is_hot && (<Badge variant="destructive" className="text-xs">热门</Badge>)}
                            {!!gpu.is_special && (<Badge className="text-xs bg-orange-500">特惠</Badge>)}
                          </div>
                        )}
                      </div>

                      {/* 价格 */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-orange-400 text-3xl font-bold">
                            ¥{gpu.price}
                          </span>
                          <span className="text-gray-400 text-sm">
                            /{gpu.price_unit}
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
                            <Zap className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-400">卡数</span>
                          </div>
                          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/50">
                            {gpu.card_count} 卡
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-gray-400">CPU</span>
                          </div>
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                            {gpu.cpu} 核
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MemoryStick className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-400">内存</span>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                            {gpu.memory} GB
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-pink-400" />
                            <span className="text-sm text-gray-400">硬盘</span>
                          </div>
                          <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/50">
                            {gpu.storage} GB
                          </Badge>
                        </div>
                      </div>

                      {/* 库存和租用按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {gpu.stock > 0 ? (
                            <span className="text-green-400">
                              库存: {gpu.stock} 台
                            </span>
                          ) : (
                            <span className="text-red-400">已租完</span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRent(gpu)}
                          disabled={gpu.stock === 0}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {gpu.stock > 0 ? "立即租用" : "已租完"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>

                  <div className="flex gap-1">
                    {/* 显示页码按钮 */}
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 10) {
                        pageNum = i + 1;
                      } else if (currentPage <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 4) {
                        pageNum = totalPages - 9 + i;
                      } else {
                        pageNum = currentPage - 4 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "text-gray-300"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-gray-300"
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
