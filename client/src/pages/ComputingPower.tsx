/**
 * 算力保障页面 - 全新设计
 * 支持多云厂商（阿里云、腾讯云、火山云）
 * 支持算力券和折扣功能
 * 
 * 修复：算力券选择始终显示
 */

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
  Cloud,
  Ticket,
  Tag,
  ShoppingCart,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 云厂商类型
interface CloudProvider {
  id: number;
  name: string;
  code: string;
  logo_url?: string;
  description: string;
  support_voucher: boolean;
  status: string;
}

// GPU资源类型
interface GPUResource {
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
  region: string;
  rental_type: string;
  billing_cycle: string;
  cloud_provider_id: number;
  cloud_provider_code: string;
  original_price: number;
  discount_rate: number;
  final_price: number;
  instance_type?: string;
  network_bandwidth?: string;
  is_hot?: boolean;
  is_special?: boolean;
  status: string;
  description?: string;
  stock?: number;
}

// 用户算力券类型
interface UserVoucher {
  id: number;
  voucher_id: number;
  voucher_code: string;
  name: string;
  cloud_provider_code?: string;
  cloud_provider_name?: string;
  type: 'amount' | 'discount' | 'free_hours';
  value: number;
  min_amount: number;
  max_discount?: number;
  valid_from?: string;
  valid_until?: string;
  status: 'unused' | 'used' | 'expired';
  description?: string;
}

export default function ComputingPower() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 云厂商列表
  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  // GPU资源列表
  const [gpuList, setGpuList] = useState<GPUResource[]>([]);
  const [filteredGPUs, setFilteredGPUs] = useState<GPUResource[]>([]);

  // 筛选条件
  const [region, setRegion] = useState("全部");
  const [selectedGPU, setSelectedGPU] = useState("all");
  const [sortBy, setSortBy] = useState("price-asc");

  // 订单对话框
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<GPUResource | null>(null);
  const [duration, setDuration] = useState("1");
  const [durationUnit, setDurationUnit] = useState("hour");
  const [quantity, setQuantity] = useState(1); // 租用数量（台）
  const [remark, setRemark] = useState(""); // 订单备注

  // 算力券
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<number | null>(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  // 价格计算
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);

  // 提交订单loading
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // 加载用户的算力券
        fetchMyVouchers(userData);
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }

    // 加载云厂商和GPU资源
    fetchCloudProviders();
    fetchGPUResources();
  }, []);

  // 获取云厂商列表
  const fetchCloudProviders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cloud-providers?status=active`);
      const data = await response.json();
      if (data.success) {
        setCloudProviders(data.data);
      }
    } catch (error) {
      console.error('获取云厂商失败:', error);
    }
  };

  // 获取GPU资源
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
      toast.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取我的算力券
  const fetchMyVouchers = async (userData: any) => {
    setVouchersLoading(true);
    try {
      const token = userData.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vouchers/my?status=unused`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('[算力券] 获取结果:', data); // 调试信息
      if (data.success) {
        setMyVouchers(data.data || []);
        console.log('[算力券] 可用券数量:', data.data?.length || 0);
      } else {
        console.warn('[算力券] 获取失败:', data.message);
      }
    } catch (error) {
      console.error('[算力券] 获取失败:', error);
    } finally {
      setVouchersLoading(false);
    }
  };

  // 筛选和排序
  useEffect(() => {
    let filtered = gpuList.filter((gpu) => {
      if (selectedProvider !== "all" && gpu.cloud_provider_code !== selectedProvider) return false;
      if (selectedGPU !== "all" && !gpu.model.includes(selectedGPU)) return false;
      if (region !== "全部" && gpu.region !== region) return false;
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
        default:
          return 0;
      }
    });

    setFilteredGPUs(filtered);
  }, [gpuList, selectedProvider, selectedGPU, region, sortBy]);

  // 打开订单对话框
  const handleOrder = (resource: GPUResource) => {
    if (!user) {
      toast.error("请先登录");
      setLocation("/login");
      return;
    }

    if (!user.verified) {
      toast.error("请先完成实名认证");
      setLocation("/account?tab=verification");
      return;
    }

    if (resource.stock === 0) {
      toast.error("该配置已售罄");
      return;
    }

    setSelectedResource(resource);
    setDuration("1");
    setDurationUnit("hour");
    setQuantity(1);
    setRemark("");
    setSelectedVoucher(null);
    setVoucherDiscount(0);
    calculatePrice(resource, 1, "hour", 1, null);
    setOrderDialogOpen(true);
  };

  // 计算价格
  const calculatePrice = async (
    resource: GPUResource,
    dur: number,
    unit: string,
    qty: number,
    voucherId: number | null
  ) => {
    // 根据时长单位计算总时长（转换为小时）
    let totalHours = dur;
    switch (unit) {
      case 'hour':
        totalHours = dur;
        break;
      case 'day':
        totalHours = dur * 24;
        break;
      case 'month':
        totalHours = dur * 24 * 30;
        break;
      case 'year':
        totalHours = dur * 24 * 365;
        break;
    }

    // 原价 = 单价 * 总时长 * 数量
    const original = resource.price * totalHours * qty;
    setOriginalPrice(original);

    // 计算产品折扣
    let discount = 0;
    if (resource.discount_rate > 0) {
      discount = original * (resource.discount_rate / 100);
    }
    setDiscountAmount(discount);

    // 计算算力券抵扣
    let voucherAmount = 0;
    if (voucherId && user) {
      try {
        const token = user.token || localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vouchers/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userVoucherId: voucherId,
            orderAmount: original - discount,
            cloudProviderCode: resource.cloud_provider_code
          })
        });
        const data = await response.json();
        if (data.success && data.valid) {
          voucherAmount = data.discountAmount;
        } else if (!data.valid) {
          toast.error(data.message || '算力券不可用');
          setSelectedVoucher(null);
        }
      } catch (error) {
        console.error('验证算力券失败:', error);
      }
    }
    setVoucherDiscount(voucherAmount);

    // 最终价格
    const final = Math.max(0, original - discount - voucherAmount);
    setFinalPrice(final);
  };

  // 时长、数量、算力券变化时重新计算价格
  useEffect(() => {
    if (selectedResource) {
      calculatePrice(
        selectedResource,
        parseInt(duration) || 1,
        durationUnit,
        quantity,
        selectedVoucher
      );
    }
  }, [duration, durationUnit, quantity, selectedVoucher]);

  // 提交订单
  const handleSubmitOrder = async () => {
    if (!selectedResource || !user) return;

    setSubmitting(true);
    try {
      const token = user.token || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/computing/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resourceId: selectedResource.id,
          duration: parseInt(duration),
          durationUnit,
          quantity,
          userVoucherId: selectedVoucher,
          remark: remark.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('订单创建成功！');
        setOrderDialogOpen(false);
        // 跳转到订单详情或支付页面
        setLocation(`/orders/${data.data.orderId}`);
      } else {
        toast.error(data.message || '创建订单失败');
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      toast.error('提交订单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 获取可用的算力券（针对当前资源）
  const getAvailableVouchers = () => {
    if (!selectedResource) return [];
    const available = myVouchers.filter(v => {
      // 检查云厂商限制
      if (v.cloud_provider_code && v.cloud_provider_code !== selectedResource.cloud_provider_code) {
        return false;
      }
      // 检查最低消费
      const priceAfterDiscount = originalPrice - discountAmount;
      if (priceAfterDiscount < v.min_amount) {
        return false;
      }
      return true;
    });
    console.log('[算力券] 可用券:', available.length, '/', myVouchers.length);
    return available;
  };

  // GPU型号选项
  const gpuModels = [
    { value: "all", label: "全部型号" },
    ...Array.from(new Set(gpuList.map(gpu => gpu.model)))
      .map(model => ({ value: model, label: model }))
  ];

  // 区域选项
  const regions = [
    "全部",
    ...Array.from(new Set(gpuList.map(gpu => gpu.region)))
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        {/* 页面标题 */}
        <div className="container py-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-7 w-7 text-blue-400" />
            <h1 className="text-4xl font-bold">算力保障</h1>
          </div>
          <p className="text-gray-400 text-lg">
            提供阿里云、腾讯云、火山云等多云厂商AI算力资源，支持算力券抵扣
          </p>
        </div>

        {/* 筛选区域 */}
        <div className="bg-gray-800 border-y border-gray-700">
          <div className="container py-6">
            <div className="bg-gray-800  border-gray-700">
              <div className="container py-6">
                <div className="flex items-center gap-4 mb-4">
                  <Cloud className="h-5 w-5 text-blue-400" />
                  <label className="text-sm font-medium">选择云厂商</label>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    variant={selectedProvider === "all" ? "default" : "outline"}
                    onClick={() => setSelectedProvider("all")}
                    className={selectedProvider === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    全部
                  </Button>
                  {cloudProviders.map((provider) => (
                    <Button
                      key={provider.code}
                      variant={selectedProvider === provider.code ? "default" : "outline"}
                      onClick={() => setSelectedProvider(provider.code)}
                      className={`relative ${selectedProvider === provider.code ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    >
                      {provider.name}
                      {!!provider.support_voucher && (
                        <Ticket className="ml-2 h-4 w-4 text-yellow-400" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {/* 其他筛选条件 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2 block text-sm text-gray-400">GPU型号</Label>
                <Select value={selectedGPU} onValueChange={setSelectedGPU}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {gpuModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 区域 */}
              <div>
                <Label className="mb-2 block text-sm text-gray-400">区域</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
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

              {/* 排序 */}
              <div>
                <Label className="mb-2 block text-sm text-gray-400">排序</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">价格从低到高</SelectItem>
                    <SelectItem value="price-desc">价格从高到低</SelectItem>
                    <SelectItem value="vram-desc">显存从大到小</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* GPU资源列表 */}
        <div className="container py-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : filteredGPUs.length === 0 ? (
            <div className="text-center py-20">
              <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无符合条件的资源</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGPUs.map((gpu) => {
                const provider = cloudProviders.find(p => p.id === gpu.cloud_provider_id);
                return (
                  <Card key={gpu.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all">
                    <CardContent className="p-6">
                      {/* 云厂商标签 */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {provider?.name || '未知'}
                        </Badge>
                        <div className="flex gap-2">
                          {!!gpu.is_hot && (<Badge variant="destructive" className="text-xs">热门</Badge>)}
                          {gpu.discount_rate > 0 && (
                            <Badge className="bg-green-600 text-xs">
                              {gpu.discount_rate}折
                            </Badge>
                          )}
                          {!!provider?.support_voucher && (
                            <Ticket className="h-4 w-4 text-yellow-400" title="支持算力券" />
                          )}
                        </div>
                      </div>

                      {/* GPU型号 */}
                      <h3 className="text-2xl font-bold mb-2">{gpu.model}</h3>
                      <p className="text-gray-400 text-sm mb-4">{gpu.region}</p>

                      {/* 配置信息 */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MemoryStick className="h-4 w-4 text-gray-400" />
                          <span>{gpu.vram}GB VRAM × {gpu.card_count}卡</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Cpu className="h-4 w-4 text-gray-400" />
                          <span>{gpu.cpu}核CPU / {gpu.memory}GB内存</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <HardDrive className="h-4 w-4 text-gray-400" />
                          <span>{gpu.storage}GB存储</span>
                        </div>
                      </div>

                      {/* 价格 */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-blue-400">
                            ¥{parseFloat(gpu.price).toFixed(2)}
                          </span>
                          <span className="text-gray-400 text-sm">/小时</span>
                        </div>
                        {gpu.discount_rate > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm line-through text-gray-500">
                              ¥{gpu.original_price.toFixed(2)}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              {gpu.discount_rate}%折扣
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* 库存 */}
                      <div className="text-sm text-gray-400 mb-4">
                        库存: {gpu.stock || 0}台
                      </div>

                      {/* 立即租用按钮 */}
                      <Button
                        onClick={() => handleOrder(gpu)}
                        disabled={!gpu.stock || gpu.stock === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        立即租用
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 订单确认对话框 */}
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>确认订单</DialogTitle>
              <DialogDescription className="text-gray-400">
                请确认您的订单信息
              </DialogDescription>
            </DialogHeader>

            {selectedResource && (
              <div className="space-y-6">
                {/* 资源信息 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">资源信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">云厂商</span>
                      <span>{cloudProviders.find(p => p.id === selectedResource.cloud_provider_id)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPU型号</span>
                      <span>{selectedResource.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">配置</span>
                      <span>{selectedResource.vram}GB × {selectedResource.card_count}卡 / {selectedResource.cpu}核CPU / {selectedResource.memory}GB内存</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">区域</span>
                      <span>{selectedResource.region}</span>
                    </div>
                  </div>
                </div>

                {/* 租用数量 */}
                <div>
                  <Label className="mb-2 block">租用数量</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    />
                    <span className="text-gray-400">台</span>
                  </div>
                </div>

                {/* 租用时长 */}
                <div>
                  <Label className="mb-2 block">租用时长</Label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2"
                    />
                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hour">小时</SelectItem>
                        <SelectItem value="day">天</SelectItem>
                        <SelectItem value="month">月</SelectItem>
                        <SelectItem value="year">年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 算力券选择 - 始终显示 */}
                <div>
                  <Label className="mb-2 block flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-yellow-400" />
                    选择算力券（可选）
                    {vouchersLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </Label>

                  {!user ? (
                    <div className="bg-gray-900 rounded p-4 text-sm text-gray-400">
                      请先登录以使用算力券
                    </div>
                  ) : getAvailableVouchers().length === 0 ? (
                    <div className="bg-gray-900 rounded p-4">
                      <div className="text-sm text-gray-400 mb-2">
                        {myVouchers.length === 0 ? (
                          <>
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            暂无可用算力券
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 inline mr-1" />
                            当前订单金额不满足算力券使用条件
                          </>
                        )}
                      </div>
                      {myVouchers.length > 0 && (
                        <div className="text-xs text-gray-500">
                          您有 {myVouchers.length} 张算力券，但不适用于当前订单
                        </div>
                      )}
                    </div>
                  ) : (
                    <RadioGroup value={selectedVoucher?.toString() || ""} onValueChange={(v) => setSelectedVoucher(v ? parseInt(v) : null)}>
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="" id="no-voucher" />
                        <Label htmlFor="no-voucher" className="cursor-pointer">
                          不使用算力券
                        </Label>
                      </div>
                      {getAvailableVouchers().map((voucher) => (
                        <div key={voucher.id} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={voucher.id.toString()} id={`voucher-${voucher.id}`} />
                          <Label htmlFor={`voucher-${voucher.id}`} className="cursor-pointer flex-1">
                            <div className="flex items-center justify-between bg-gray-900 rounded p-3">
                              <div>
                                <div className="font-medium">{voucher.name}</div>
                                <div className="text-xs text-gray-400">
                                  {voucher.type === 'amount' && `抵扣¥${voucher.value}`}
                                  {voucher.type === 'discount' && `${voucher.value}折`}
                                  {voucher.type === 'free_hours' && `免费${voucher.value}小时`}
                                  {voucher.min_amount > 0 && ` · 满¥${voucher.min_amount}可用`}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                {voucher.cloud_provider_name || '通用'}
                              </Badge>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                {/* 价格明细 */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">价格明细</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">原价</span>
                      <span>¥{originalPrice.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>产品折扣</span>
                        <span>-¥{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>算力券抵扣</span>
                        <span>-¥{voucherDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>最终价格</span>
                        <span className="text-blue-400">¥{finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 订单备注（可选） */}
                <div>
                  <Label className="mb-2 block">订单备注（可选）</Label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="如有特殊需求，请在此说明..."
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    {remark.length}/500
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOrderDialogOpen(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    提交中...
                  </>
                ) : (
                  '确认下单'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </>
  );
}
