import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Server,
  Calendar,
  DollarSign,
  Ticket,
  CreditCard,
  MapPin,
} from "lucide-react";

interface OrderDetail {
  id: number;
  order_no: string;
  user_id: number;
  resource_id: number;
  cloud_provider_id: number;
  cloud_provider_code: string;
  gpu_model: string;
  quantity: number;
  duration: number;
  duration_unit: string;
  original_price: number;
  discount_amount: number;
  voucher_amount: number;
  final_price: number;
  voucher_id: number | null;
  discount_id: number | null;
  status: string;
  instance_info: string | null;
  start_time: string | null;
  end_time: string | null;
  payment_method: string | null;
  payment_time: string | null;
  remark: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: {
    label: "待支付",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  paid: {
    label: "已支付",
    icon: CheckCircle2,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  running: {
    label: "运行中",
    icon: Server,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  completed: {
    label: "已完成",
    icon: CheckCircle2,
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  cancelled: {
    label: "已取消",
    icon: XCircle,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  failed: {
    label: "失败",
    icon: AlertCircle,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

const durationUnitMap: Record<string, string> = {
  hour: "小时",
  day: "天",
  month: "月",
  year: "年",
};

export default function OrderDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id;

  useEffect(() => {
    if (!orderId) {
      setError("订单ID无效");
      setLoading(false);
      return;
    }

    // 模拟从API获取订单详情
    // TODO: 替换为实际的API调用
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        
        // 临时模拟数据
        const mockOrder: OrderDetail = {
          id: parseInt(orderId),
          order_no: `CO${Date.now()}`,
          user_id: 1,
          resource_id: 1,
          cloud_provider_id: 1,
          cloud_provider_code: "aliyun",
          gpu_model: "RTX 4090",
          quantity: 2,
          duration: 24,
          duration_unit: "hour",
          original_price: 72.0,
          discount_amount: 3.6,
          voucher_amount: 10.0,
          final_price: 58.4,
          voucher_id: 1,
          discount_id: 1,
          status: "paid",
          instance_info: null,
          start_time: null,
          end_time: null,
          payment_method: "balance",
          payment_time: new Date().toISOString(),
          remark: "测试订单",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        setOrder(mockOrder);
        setError(null);
      } catch (err) {
        console.error("获取订单详情失败:", err);
        setError("获取订单详情失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleBack = () => {
    navigate("/billing");
  };

  const handlePay = () => {
    // TODO: 实现支付逻辑
    console.log("跳转到支付页面");
  };

  const handleCancel = () => {
    // TODO: 实现取消订单逻辑
    console.log("取消订单");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载订单详情...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">{error || "订单不存在"}</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回订单列表
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回订单列表
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：订单详情 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 订单状态卡片 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">订单详情</CardTitle>
                    <CardDescription className="mt-2">
                      订单号: {order.order_no}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusInfo.color}
                  >
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 资源信息 */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                    <Server className="h-4 w-4 mr-2" />
                    资源信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">GPU型号</p>
                      <p className="text-base font-medium">{order.gpu_model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">云服务商</p>
                      <p className="text-base font-medium capitalize">{order.cloud_provider_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">数量</p>
                      <p className="text-base font-medium">{order.quantity} 张</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">租用时长</p>
                      <p className="text-base font-medium">
                        {order.duration} {durationUnitMap[order.duration_unit] || order.duration_unit}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 时间信息 */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    时间信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">创建时间</p>
                      <p className="text-base font-medium">
                        {new Date(order.created_at).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    {order.payment_time && (
                      <div>
                        <p className="text-sm text-muted-foreground">支付时间</p>
                        <p className="text-base font-medium">
                          {new Date(order.payment_time).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    )}
                    {order.start_time && (
                      <div>
                        <p className="text-sm text-muted-foreground">开始时间</p>
                        <p className="text-base font-medium">
                          {new Date(order.start_time).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    )}
                    {order.end_time && (
                      <div>
                        <p className="text-sm text-muted-foreground">结束时间</p>
                        <p className="text-base font-medium">
                          {new Date(order.end_time).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {order.remark && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2">备注</h3>
                      <p className="text-base">{order.remark}</p>
                    </div>
                  </>
                )}

                {order.instance_info && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        实例信息
                      </h3>
                      <pre className="text-sm bg-muted p-3 rounded-md overflow-x-auto">
                        {order.instance_info}
                      </pre>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：价格信息和操作 */}
          <div className="space-y-6">
            {/* 价格明细卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  价格明细
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">原价</span>
                  <span className="font-medium">¥{order.original_price.toFixed(2)}</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Ticket className="h-4 w-4 mr-1" />
                      折扣优惠
                    </span>
                    <span>-¥{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}

                {order.voucher_amount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span className="flex items-center">
                      <Ticket className="h-4 w-4 mr-1" />
                      算力券抵扣
                    </span>
                    <span>-¥{order.voucher_amount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>实付金额</span>
                  <span className="text-primary">¥{order.final_price.toFixed(2)}</span>
                </div>

                {order.payment_method && (
                  <div className="flex items-center text-sm text-muted-foreground pt-2">
                    <CreditCard className="h-4 w-4 mr-2" />
                    支付方式: {order.payment_method === "balance" ? "账户余额" : order.payment_method}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {order.status === "pending" && (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePay}
                    >
                      立即支付
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCancel}
                    >
                      取消订单
                    </Button>
                  </>
                )}

                {order.status === "paid" && (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      订单已支付，等待资源分配
                    </p>
                  </div>
                )}

                {order.status === "running" && (
                  <div className="text-center py-4">
                    <Server className="h-12 w-12 text-green-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-sm text-muted-foreground">
                      资源运行中
                    </p>
                  </div>
                )}

                {order.status === "completed" && (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      订单已完成
                    </p>
                  </div>
                )}

                {(order.status === "cancelled" || order.status === "failed") && (
                  <div className="text-center py-4">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {order.status === "cancelled" ? "订单已取消" : "订单失败"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
