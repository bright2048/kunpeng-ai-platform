import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  FileText,
  Eye,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  full_description?: string;
  status: string;
  is_hot: boolean;
  is_new: boolean;
  is_recommended: boolean;
  view_count: number;
  sales_count: number;
  created_at: string;
}

export default function HardwareDetail() {
  const [, params] = useRoute("/hardware/:id");
  const [, setLocation] = useLocation();

  const [product, setProduct] = useState<HardwareProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productId = params?.id;

  // 获取产品详情
  useEffect(() => {
    if (productId) {
      fetchProductDetail(parseInt(productId));
    }
  }, [productId]);

  const fetchProductDetail = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/hardware/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        toast.error(data.message || "获取产品详情失败");
        setLocation("/services/hardware");
      }
    } catch (error) {
      console.error("获取产品详情失败:", error);
      toast.error("网络错误，请稍后重试");
      setLocation("/services/hardware");
    } finally {
      setLoading(false);
    }
  };

  // 处理购买
  const handlePurchase = () => {
    if (!product) return;

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
    setLocation(`/hardware/${product.id}/order`);
  };

  // 图片轮播
  const nextImage = () => {
    if (!product || !product.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product || !product.images) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  // 获取品类名称
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      laptop: "笔记本",
      desktop: "台式机",
      server: "服务器",
      printer: "打印机",
      monitor: "显示器",
      switch: "交换机",
      router: "路由器",
      firewall: "防火墙",
      other: "其他",
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">加载中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <p className="text-gray-400 text-lg">产品不存在</p>
            <Button
              onClick={() => setLocation("/services/hardware")}
              className="mt-4"
            >
              返回列表
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://via.placeholder.com/800x600?text=No+Image"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/services/hardware")}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：产品图片 */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-0">
                {/* 主图 */}
                <div className="relative h-96 overflow-hidden rounded-t-lg">
                  <img
                    src={images[currentImageIndex]}
                    alt={product.product_name}
                    className="w-full h-full object-contain bg-gray-900"
                  />

                  {/* 标签 */}
                  {(!!product.is_hot ||
                    !!product.is_new ||
                    !!product.is_recommended) && (
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {!!product.is_hot && (
                          <Badge variant="destructive" className="text-sm">
                            热门
                          </Badge>
                        )}
                        {!!product.is_new && (
                          <Badge className="text-sm bg-green-500">新品</Badge>
                        )}
                        {!!product.is_recommended && (
                          <Badge className="text-sm bg-orange-500">推荐</Badge>
                        )}
                      </div>
                    )}

                  {/* 图片轮播控制 */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>

                {/* 缩略图 */}
                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${currentImageIndex === index
                          ? "border-blue-500"
                          : "border-gray-600"
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${product.product_name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PDF详情 */}
            {product.detail_pdf && (
              <Card className="bg-gray-800/50 border-gray-700 mt-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-white">产品规格说明书</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(product.detail_pdf, "_blank")}
                    >
                      查看PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：产品信息 */}
          <div>
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                {/* 产品名称 */}
                <h1 className="text-3xl font-bold text-white mb-2">
                  {product.product_name}
                </h1>

                {/* 产品型号 */}
                <p className="text-gray-400 mb-4">型号: {product.product_model}</p>

                {/* 品类 */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-sm">
                    {getCategoryName(product.category)}
                  </Badge>
                </div>

                {/* 简要描述 */}
                {product.brief_description && (
                  <p className="text-gray-300 mb-6">{product.brief_description}</p>
                )}

                {/* 价格 */}
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-gray-400">价格:</span>
                    <span className="text-4xl font-bold text-orange-500">
                      ¥{parseFloat(product.price as any).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{product.view_count} 浏览</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{product.sales_count} 销量</span>
                    </div>
                  </div>
                </div>

                {/* 库存 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">库存:</span>
                    <span
                      className={
                        product.stock > 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {product.stock > 0 ? `${product.stock} 件` : "已售罄"}
                    </span>
                  </div>
                </div>

                {/* 购买按钮 */}
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? "已售罄" : "立即购买"}
                </Button>

                {/* 产品规格 */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-white mb-4">产品规格</h2>
                  <div className="space-y-2">
                    {product.cpu_brand && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">处理器品牌:</span>
                        <span className="text-white">{product.cpu_brand}</span>
                      </div>
                    )}
                    {product.cpu_model && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">处理器型号:</span>
                        <span className="text-white">{product.cpu_model}</span>
                      </div>
                    )}
                    {product.gpu_brand && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">GPU品牌:</span>
                        <span className="text-white">{product.gpu_brand}</span>
                      </div>
                    )}
                    {product.gpu_model && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">GPU型号:</span>
                        <span className="text-white">{product.gpu_model}</span>
                      </div>
                    )}
                    {product.memory_size && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">内存容量:</span>
                        <span className="text-white">{product.memory_size}</span>
                      </div>
                    )}
                    {product.storage_size && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">硬盘容量:</span>
                        <span className="text-white">{product.storage_size}</span>
                      </div>
                    )}
                    {product.port_count && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">端口数量:</span>
                        <span className="text-white">{product.port_count}</span>
                      </div>
                    )}
                    {product.port_speed && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">端口速率:</span>
                        <span className="text-white">{product.port_speed}</span>
                      </div>
                    )}
                    {product.network_layer && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">网络层级:</span>
                        <span className="text-white">{product.network_layer}</span>
                      </div>
                    )}
                    {product.print_type && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">打印类型:</span>
                        <span className="text-white">{product.print_type}</span>
                      </div>
                    )}
                    {product.print_speed && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">打印速度:</span>
                        <span className="text-white">{product.print_speed}</span>
                      </div>
                    )}
                    {product.print_color !== undefined && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">彩色打印:</span>
                        <span className="text-white">
                          {product.print_color ? "支持" : "不支持"}
                        </span>
                      </div>
                    )}
                    {product.screen_size && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">屏幕尺寸:</span>
                        <span className="text-white">{product.screen_size}</span>
                      </div>
                    )}
                    {product.resolution && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">分辨率:</span>
                        <span className="text-white">{product.resolution}</span>
                      </div>
                    )}
                    {product.refresh_rate && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">刷新率:</span>
                        <span className="text-white">{product.refresh_rate}</span>
                      </div>
                    )}
                    {product.panel_type && (
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">面板类型:</span>
                        <span className="text-white">{product.panel_type}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 详细描述 */}
            {product.full_description && (
              <Card className="bg-gray-800/50 border-gray-700 mt-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">产品详情</h2>
                  <div className="text-gray-300 whitespace-pre-wrap">
                    {product.full_description}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
