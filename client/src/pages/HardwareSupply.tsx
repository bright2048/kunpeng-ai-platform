import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

// 硬件产品接口
interface HardwareProduct {
  id: number;
  product_name: string;
  product_model: string;
  category: string;
  cpu_brand?: string;
  cpu_model?: string;
  gpu_brand?: string;
  gpu_model?: string;
  memory_size?: string;
  storage_size?: string;
  port_count?: number;
  port_speed?: string;
  network_layer?: string;
  print_type?: string;
  print_speed?: string;
  print_color?: boolean;
  screen_size?: string;
  resolution?: string;
  refresh_rate?: string;
  panel_type?: string;
  price: number;
  stock: number;
  images: string[];
  detail_pdf?: string;
  brief_description?: string;
  status: string;
  is_hot: boolean;
  is_new: boolean;
  is_recommended: boolean;
  view_count: number;
  sales_count: number;
  created_at?: string;
}

// 每页显示数量
const ITEMS_PER_PAGE = 40;

export default function HardwareSupply() {
  const [, setLocation] = useLocation();

  // 筛选状态
  const [category, setCategory] = useState("all");
  const [cpuBrand, setCpuBrand] = useState("all");
  const [gpuBrand, setGpuBrand] = useState("all");
  const [memorySize, setMemorySize] = useState("all");
  const [storageSize, setStorageSize] = useState("all");
  const [portSpeed, setPortSpeed] = useState("all");
  const [printType, setPrintType] = useState("all");
  const [screenSize, setScreenSize] = useState("all");
  const [resolution, setResolution] = useState("all");

  // 排序状态
  const [sortBy, setSortBy] = useState("created_at");

  // 数据状态
  const [products, setProducts] = useState<HardwareProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<HardwareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedProducts, setPaginatedProducts] = useState<HardwareProduct[]>([]);

  // 图片轮播状态
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});

  // 硬件品类选项
  const categories = [
    { value: "all", label: "全部" },
    { value: "laptop", label: "笔记本" },
    { value: "desktop", label: "台式机" },
    { value: "server", label: "服务器" },
    { value: "printer", label: "打印机" },
    { value: "monitor", label: "显示器" },
    { value: "switch", label: "交换机" },
    { value: "router", label: "路由器" },
    { value: "firewall", label: "防火墙" },
    { value: "other", label: "其他" },
  ];

  // CPU品牌选项
  const cpuBrands = [
    { value: "all", label: "全部" },
    { value: "kunpeng", label: "鲲鹏" },
    { value: "phytium", label: "飞腾" },
    { value: "hygon", label: "海光" },
    { value: "zhaoxin", label: "兆芯" },
    { value: "intel", label: "Intel" },
    { value: "amd", label: "AMD" },
    { value: "other", label: "其他" },
  ];

  // GPU品牌选项
  const gpuBrands = [
    { value: "all", label: "全部" },
    { value: "ascend", label: "昇腾" },
    { value: "moore", label: "摩尔线程" },
    { value: "enflame", label: "燧原科技" },
    { value: "jingjiawei", label: "景嘉微" },
    { value: "nvidia", label: "Nvidia" },
    { value: "amd", label: "AMD" },
    { value: "other", label: "其他" },
  ];

  // 内存容量选项
  const memorySizes = [
    { value: "all", label: "全部" },
    { value: "8G", label: "8G" },
    { value: "16G", label: "16G" },
    { value: "32G", label: "32G" },
    { value: "64G", label: "64G" },
    { value: "128G+", label: "128G以上" },
  ];

  // 硬盘容量选项
  const storageSizes = [
    { value: "all", label: "全部" },
    { value: "512G", label: "512G" },
    { value: "1T", label: "1T" },
    { value: "2T", label: "2T" },
    { value: "4T", label: "4T" },
    { value: "8T", label: "8T" },
    { value: "16T", label: "16T" },
    { value: "32T+", label: "32T及以上" },
  ];

  // 打印机类型选项
  const printTypes = [
    { value: "all", label: "全部" },
    { value: "laser", label: "激光" },
    { value: "inkjet", label: "喷墨" },
    { value: "dotmatrix", label: "针式" },
  ];

  // 端口速率选项
  const portSpeeds = [
    { value: "all", label: "全部" },
    { value: "100M", label: "百兆" },
    { value: "1G", label: "千兆" },
    { value: "10G", label: "万兆" },
    { value: "25G", label: "25G" },
    { value: "40G", label: "40G" },
    { value: "100G", label: "100G" },
  ];

  // 屏幕尺寸选项
  const screenSizes = [
    { value: "all", label: "全部" },
    { value: "21.5英寸", label: "21.5英寸" },
    { value: "24英寸", label: "24英寸" },
    { value: "27英寸", label: "27英寸" },
    { value: "32英寸", label: "32英寸" },
    { value: "34英寸", label: "34英寸" },
  ];

  // 分辨率选项
  const resolutions = [
    { value: "all", label: "全部" },
    { value: "1920x1080", label: "1080P" },
    { value: "2560x1440", label: "2K" },
    { value: "3840x2160", label: "4K" },
  ];

  // 排序选项
  const sortOptions = [
    { value: "created_at", label: "最新上架" },
    { value: "price_asc", label: "价格从低到高" },
    { value: "price_desc", label: "价格从高到低" },
    { value: "sales_count", label: "销量最高" },
  ];

  // 获取产品列表
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hardware/products?status=active`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setFilteredProducts(data.data);
      } else {
        toast.error(data.message || "获取产品列表失败");
      }
    } catch (error) {
      console.error("获取产品列表失败:", error);
      toast.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 筛选和排序
  useEffect(() => {
    let filtered = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (cpuBrand !== "all" && product.cpu_brand !== cpuBrand) return false;
      if (gpuBrand !== "all" && product.gpu_brand !== gpuBrand) return false;
      if (memorySize !== "all" && product.memory_size !== memorySize) return false;
      if (storageSize !== "all" && product.storage_size !== storageSize) return false;
      if (portSpeed !== "all" && product.port_speed !== portSpeed) return false;
      if (printType !== "all" && product.print_type !== printType) return false;
      if (screenSize !== "all" && product.screen_size !== screenSize) return false;
      if (resolution !== "all" && product.resolution !== resolution) return false;
      return true;
    });

    // 排序
    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "sales_count") {
      filtered.sort((a, b) => b.sales_count - a.sales_count);
    } else {
      filtered.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // 重置到第一页
  }, [category, cpuBrand, gpuBrand, memorySize, storageSize, portSpeed, printType, screenSize, resolution, sortBy, products]);

  // 分页处理
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, filteredProducts]);

  // 总页数
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // 分页按钮
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxButtons = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${currentPage === i
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // 处理购买
  const handlePurchase = (productId: number) => {
    const user = localStorage.getItem("user");

    if (!user) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (!userData.is_verified) {
      toast.error("请先完成实名认证");
      setLocation("/account?tab=verification");
      return;
    }

    // 跳转到订单确认页面
    setLocation(`/hardware/${productId}/order`);
  };

  // 图片轮播
  const nextImage = (productId: number, imageCount: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % imageCount,
    }));
  };

  const prevImage = (productId: number, imageCount: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + imageCount) % imageCount,
    }));
  };

  // 判断是否显示计算设备筛选
  const showComputeFilters = category === "all" || category === "laptop" || category === "desktop" || category === "server";

  // 判断是否显示网络设备筛选
  const showNetworkFilters = category === "switch" || category === "router" || category === "firewall";

  // 判断是否显示打印机筛选
  const showPrinterFilters = category === "printer";

  // 判断是否显示显示器筛选
  const showMonitorFilters = category === "monitor";

  return (
    // <>
    //   <Navbar />
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* 页面标题 */}
      <Navbar />
      <div>

      </div>
      <div className="container bg-gray-900 text-white pt-20">
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">硬件供给</h1>
          <p className="text-gray-400 text-lg">
            提供优质的国产化硬件设备，支持鲲鹏、飞腾、海光等自主可控芯片
          </p>
        </div>

        {/* 筛选器 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 space-y-4">
          {/* 硬件品类 */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
              <Filter className="w-4 h-4" />
              <span>硬件品类</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-md transition-colors ${category === cat.value
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 计算设备筛选 */}
          {showComputeFilters && (
            <>
              {/* CPU品牌 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>处理器品牌</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {cpuBrands.map((brand) => (
                    <button
                      key={brand.value}
                      onClick={() => setCpuBrand(brand.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${cpuBrand === brand.value
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GPU品牌 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>GPU品牌</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {gpuBrands.map((brand) => (
                    <button
                      key={brand.value}
                      onClick={() => setGpuBrand(brand.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${gpuBrand === brand.value
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {brand.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 内存容量 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>内存容量</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {memorySizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setMemorySize(size.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${memorySize === size.value
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 硬盘容量 */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>硬盘容量</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {storageSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setStorageSize(size.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${storageSize === size.value
                        ? "bg-pink-600 hover:bg-pink-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 网络设备筛选 */}
          {showNetworkFilters && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                <span>端口速率</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {portSpeeds.map((speed) => (
                  <button
                    key={speed.value}
                    onClick={() => setPortSpeed(speed.value)}
                    className={`px-4 py-2 rounded-md transition-colors ${portSpeed === speed.value
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                  >
                    {speed.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 打印机筛选 */}
          {showPrinterFilters && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                <span>打印类型</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {printTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPrintType(type.value)}
                    className={`px-4 py-2 rounded-md transition-colors ${printType === type.value
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 显示器筛选 */}
          {showMonitorFilters && (
            <>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>屏幕尺寸</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {screenSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setScreenSize(size.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${screenSize === size.value
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
                  <span>分辨率</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {resolutions.map((res) => (
                    <button
                      key={res.value}
                      onClick={() => setResolution(res.value)}
                      className={`px-4 py-2 rounded-md transition-colors ${resolution === res.value
                        ? "bg-lime-600 hover:bg-lime-700 text-white"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 排序方式 */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-gray-300 min-w-[80px]">
              <span>排序方式</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-md transition-colors ${sortBy === option.value
                    ? "bg-gray-600 text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 产品统计 */}
        <div className="text-gray-400 mb-6">
          共找到 {filteredProducts.length} 个产品
          {totalPages > 1 && ` (第 ${currentPage}/${totalPages} 页)`}
        </div>

        {/* 产品列表 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">加载中...</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">暂无符合条件的产品</p>
            <p className="text-gray-500 text-sm mt-2">
              请尝试修改筛选条件或稍后再试
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const currentIndex = currentImageIndex[product.id] || 0;
                const images = product.images && product.images.length > 0
                  ? product.images
                  : ["https://via.placeholder.com/600x400?text=No+Image"];

                return (
                  <Card
                    key={product.id}
                    className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/hardware/${product.id}`)}
                  >
                    <CardContent className="p-0">
                      {/* 产品图片 */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg">
                        <img
                          src={images[currentIndex]}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* 标签 */}
                        {(!!product.is_hot || !!product.is_new || !!product.is_recommended) && (
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {!!product.is_hot && (
                              <Badge variant="destructive" className="text-xs">
                                热门
                              </Badge>
                            )}
                            {!!product.is_new && (
                              <Badge className="text-xs bg-green-500">新品</Badge>
                            )}
                            {!!product.is_recommended && (
                              <Badge className="text-xs bg-orange-500">推荐</Badge>
                            )}
                          </div>
                        )}

                        {/* 图片轮播控制 */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                prevImage(product.id, images.length);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                nextImage(product.id, images.length);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* 图片指示器 */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {images.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-1.5 h-1.5 rounded-full ${index === currentIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                    }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* 产品信息 */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                          {product.product_name}
                        </h3>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {product.brief_description}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-orange-500">
                              ¥{parseFloat(product.price as any).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            库存: {product.stock}
                          </div>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(product.id);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {product.stock === 0 ? "已售罄" : "立即购买"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 分页 */}
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}
