import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { Wallet, CreditCard, Gift, TrendingUp, Clock, CheckCircle, XCircle, Loader2, ShoppingCart, Eye, Cpu, Server } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AccountInfo {
  balance: number;
  frozenBalance: number;
  totalRecharge: number;
  totalConsumption: number;
  totalVoucherBalance: number;
  vouchers: Voucher[];
}

interface Voucher {
  id: number;
  voucherNo: string;
  amount: number;
  balance: number;
  sourceType: string;
  expireAt: string | null;
  createdAt: string;
}

interface RechargeConfig {
  id: number;
  amount: number;
  giftRatio: number;
  giftAmount: number;
  isRecommended: boolean;
}

interface RechargeRecord {
  id: number;
  orderNo: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface Transaction {
  id: number;
  transactionNo: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

interface ConsumptionOrder {
  id: number;
  orderNo: string;
  resourceType: string;
  resourceName: string;
  quantity: number;
  duration: number;
  durationUnit: string;
  totalAmount: number;
  voucherUsed: number;
  balanceUsed: number;
  status: string;
  createdAt: string;
  startTime: string | null;
  endTime: string | null;
  remark: string;
}

export default function BillingCenter() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [rechargeConfigs, setRechargeConfigs] = useState<RechargeConfig[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [consumptionOrders, setConsumptionOrders] = useState<ConsumptionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ConsumptionOrder | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [recharging, setRecharging] = useState(false);

  // 模拟消费订单数据
  const mockConsumptionOrders: ConsumptionOrder[] = [
    {
      id: 1,
      orderNo: "ORD20241125001",
      resourceType: "gpu_rental",
      resourceName: "RTX 4090 (24GB)",
      quantity: 1,
      duration: 24,
      durationUnit: "小时",
      totalAmount: 43.20,
      voucherUsed: 43.20,
      balanceUsed: 0,
      status: "completed",
      createdAt: "2024-11-25T10:30:00",
      startTime: "2024-11-25T10:30:00",
      endTime: "2024-11-26T10:30:00",
      remark: "深度学习模型训练"
    },
    {
      id: 2,
      orderNo: "ORD20241124002",
      resourceType: "gpu_rental",
      resourceName: "A100 (80GB)",
      quantity: 2,
      duration: 12,
      durationUnit: "小时",
      totalAmount: 204.00,
      voucherUsed: 150.00,
      balanceUsed: 54.00,
      status: "running",
      createdAt: "2024-11-24T14:20:00",
      startTime: "2024-11-24T14:20:00",
      endTime: "2024-11-25T02:20:00",
      remark: "大语言模型微调"
    },
    {
      id: 3,
      orderNo: "ORD20241123003",
      resourceType: "gpu_rental",
      resourceName: "H100 (80GB)",
      quantity: 1,
      duration: 6,
      durationUnit: "小时",
      totalAmount: 90.00,
      voucherUsed: 90.00,
      balanceUsed: 0,
      status: "completed",
      createdAt: "2024-11-23T09:15:00",
      startTime: "2024-11-23T09:15:00",
      endTime: "2024-11-23T15:15:00",
      remark: "AI推理测试"
    }
  ];

  // 获取账户信息
  const fetchAccountInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/billing/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAccountInfo(result.data);
      }
    } catch (error) {
      console.error('获取账户信息失败:', error);
      toast.error('获取账户信息失败');
    }
  };

  // 获取充值配置
  const fetchRechargeConfigs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/billing/recharge-configs');
      const result = await response.json();
      if (result.success) {
        setRechargeConfigs(result.data);
      }
    } catch (error) {
      console.error('获取充值配置失败:', error);
    }
  };

  // 获取充值记录
  const fetchRechargeRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/billing/recharge-records?page=1&pageSize=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setRechargeRecords(result.data.records);
      }
    } catch (error) {
      console.error('获取充值记录失败:', error);
    }
  };

  // 获取账户流水
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/billing/transactions?page=1&pageSize=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTransactions(result.data.transactions);
      }
    } catch (error) {
      console.error('获取账户流水失败:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAccountInfo(),
        fetchRechargeConfigs(),
        fetchRechargeRecords(),
        fetchTransactions()
      ]);
      // 加载模拟消费订单数据
      setConsumptionOrders(mockConsumptionOrders);
      setLoading(false);
    };
    loadData();
  }, []);

  // 处理充值
  const handleRecharge = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast.error('请选择或输入充值金额');
      return;
    }

    setRecharging(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/billing/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod: 'alipay'
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.data.message);
        setRechargeDialogOpen(false);
        
        // 模拟支付成功回调
        setTimeout(async () => {
          const callbackResponse = await fetch('http://localhost:3001/api/billing/payment-callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              orderNo: result.data.orderNo,
              transactionId: `TXN${Date.now()}`,
              status: 'success'
            })
          });
          
          const callbackResult = await callbackResponse.json();
          if (callbackResult.success) {
            toast.success(callbackResult.message);
            await Promise.all([
              fetchAccountInfo(),
              fetchRechargeRecords(),
              fetchTransactions()
            ]);
          }
        }, 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('充值失败:', error);
      toast.error('充值失败，请稍后重试');
    } finally {
      setRecharging(false);
    }
  };

  // 查看订单详情
  const handleViewOrderDetail = (order: ConsumptionOrder) => {
    setSelectedOrder(order);
    setOrderDetailDialogOpen(true);
  };

  // 获取订单状态徽章
  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: '待支付', variant: 'outline' },
      running: { label: '进行中', variant: 'default' },
      completed: { label: '已完成', variant: 'secondary' },
      cancelled: { label: '已取消', variant: 'destructive' }
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: '待支付', variant: 'outline' },
      success: { label: '已完成', variant: 'default' },
      failed: { label: '失败', variant: 'destructive' },
      cancelled: { label: '已取消', variant: 'secondary' }
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // 获取交易类型标签
  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      consumption: '消费',
      refund: '退款',
      freeze: '冻结',
      unfreeze: '解冻'
    };
    return typeMap[type] || type;
  };

  // 获取资源类型图标
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'gpu_rental':
        return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'space_rental':
        return <Server className="w-5 h-5 text-green-500" />;
      default:
        return <ShoppingCart className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-white pt-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">费用中心</h1>

          {/* 账户概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 账户余额 */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  账户余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ¥{accountInfo?.balance.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-blue-100 mt-2">
                  冻结: ¥{accountInfo?.frozenBalance.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>

            {/* 算力券余额 */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  算力券余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ¥{accountInfo?.totalVoucherBalance.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-purple-100 mt-2">
                  {accountInfo?.vouchers.length || 0} 张可用
                </div>
              </CardContent>
            </Card>

            {/* 累计充值 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  累计充值
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{accountInfo?.totalRecharge.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>

            {/* 累计消费 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  累计消费
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{accountInfo?.totalConsumption.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 充值按钮 */}
          <div className="mb-8">
            <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Wallet className="w-5 h-5 mr-2" />
                  立即充值
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>账户充值</DialogTitle>
                  <DialogDescription>
                    充值即送算力券！充值100元赠送150元算力券（赠送比例1.5倍）
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* 快捷充值金额 */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">选择充值金额</label>
                    <div className="grid grid-cols-3 gap-3">
                      {rechargeConfigs.map((config) => (
                        <button
                          key={config.id}
                          onClick={() => {
                            setSelectedAmount(config.amount);
                            setCustomAmount("");
                          }}
                          className={`relative p-4 rounded-lg border-2 transition-all ${
                            selectedAmount === config.amount
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {config.isRecommended && (
                            <Badge className="absolute -top-2 -right-2 bg-red-500">推荐</Badge>
                          )}
                          <div className="text-xl font-bold">¥{config.amount}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            送 ¥{config.giftAmount} 算力券
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 自定义金额 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">或输入自定义金额</label>
                    <Input
                      type="number"
                      placeholder="请输入充值金额"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      min="0.01"
                      step="0.01"
                    />
                    {customAmount && parseFloat(customAmount) > 0 && (
                      <div className="text-sm text-gray-400 mt-2">
                        将赠送 ¥{(parseFloat(customAmount) * 1.5).toFixed(2)} 算力券
                      </div>
                    )}
                  </div>

                  {/* 支付方式 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">支付方式</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 rounded-lg border-2 border-blue-500 bg-blue-500/10 flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        <span>支付宝</span>
                      </button>
                      <button className="p-3 rounded-lg border-2 border-gray-700 hover:border-gray-600 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <CreditCard className="w-5 h-5" />
                        <span>微信支付</span>
                      </button>
                    </div>
                  </div>

                  {/* 充值说明 */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm">
                    <div className="font-medium mb-2">充值说明：</div>
                    <ul className="space-y-1 text-gray-400">
                      <li>• 充值金额实时到账，可用于平台所有付费服务</li>
                      <li>• 算力券仅可用于算力消费（GPU租用等），有效期1年</li>
                      <li>• 消费时优先使用算力券，不足部分使用账户余额</li>
                      <li>• 充值金额不可提现，请根据实际需求充值</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleRecharge}
                    disabled={recharging || (!selectedAmount && !customAmount)}
                  >
                    {recharging ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        确认充值 ¥{(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 算力券列表 */}
          {accountInfo && accountInfo.vouchers.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  我的算力券
                </CardTitle>
                <CardDescription>
                  共 {accountInfo.vouchers.length} 张，总余额 ¥{accountInfo.totalVoucherBalance.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accountInfo.vouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="p-4 rounded-lg border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {voucher.sourceType === 'recharge_gift' ? '充值赠送' : '其他'}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {voucher.voucherNo}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        ¥{voucher.balance.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        原始金额: ¥{voucher.amount.toFixed(2)}
                      </div>
                      {voucher.expireAt && (
                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(voucher.expireAt).toLocaleDateString()} 到期
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs: 消费订单、充值记录、账户流水 */}
          <Tabs defaultValue="orders" className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">消费订单</TabsTrigger>
              <TabsTrigger value="recharge">充值记录</TabsTrigger>
              <TabsTrigger value="transactions">账户流水</TabsTrigger>
            </TabsList>

            {/* 消费订单 */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    消费订单
                  </CardTitle>
                  <CardDescription>
                    查看所有消费订单记录
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {consumptionOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      暂无消费订单
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {consumptionOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                              {getResourceIcon(order.resourceType)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{order.resourceName}</span>
                                {getOrderStatusBadge(order.status)}
                              </div>
                              <div className="text-sm text-gray-400">
                                订单号: {order.orderNo} · {new Date(order.createdAt).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-400 mt-1">
                                数量: {order.quantity} · 时长: {order.duration}{order.durationUnit}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold">¥{order.totalAmount.toFixed(2)}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {order.voucherUsed > 0 && (
                                  <span className="text-purple-400">算力券 ¥{order.voucherUsed.toFixed(2)}</span>
                                )}
                                {order.voucherUsed > 0 && order.balanceUsed > 0 && <span> + </span>}
                                {order.balanceUsed > 0 && (
                                  <span className="text-blue-400">余额 ¥{order.balanceUsed.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewOrderDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              详情
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 充值记录 */}
            <TabsContent value="recharge">
              <Card>
                <CardHeader>
                  <CardTitle>充值记录</CardTitle>
                </CardHeader>
                <CardContent>
                  {rechargeRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      暂无充值记录
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rechargeRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              {record.status === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : record.status === 'failed' ? (
                                <XCircle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">充值 ¥{record.amount.toFixed(2)}</div>
                              <div className="text-sm text-gray-400">
                                {record.orderNo} · {new Date(record.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(record.status)}
                            <div className="text-xs text-gray-400 mt-1">
                              {record.paymentMethod === 'alipay' ? '支付宝' : record.paymentMethod}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 账户流水 */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>账户流水</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      暂无流水记录
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {getTransactionTypeLabel(tx.type)}
                              </Badge>
                              <span className="text-sm">{tx.description}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {tx.transactionNo} · {new Date(tx.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-medium ${
                              tx.type === 'recharge' || tx.type === 'refund' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {tx.type === 'recharge' || tx.type === 'refund' ? '+' : '-'}
                              ¥{tx.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                              余额: ¥{tx.balanceAfter.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 订单详情对话框 */}
      <Dialog open={orderDetailDialogOpen} onOpenChange={setOrderDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>
              查看订单的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              {/* 订单状态 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">订单状态</span>
                {getOrderStatusBadge(selectedOrder.status)}
              </div>
              
              <Separator />

              {/* 订单信息 */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">订单号</span>
                  <span className="text-sm font-medium">{selectedOrder.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">资源类型</span>
                  <span className="text-sm font-medium">
                    {selectedOrder.resourceType === 'gpu_rental' ? 'GPU租用' : '其他'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">资源名称</span>
                  <span className="text-sm font-medium">{selectedOrder.resourceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">数量</span>
                  <span className="text-sm font-medium">{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">租用时长</span>
                  <span className="text-sm font-medium">{selectedOrder.duration} {selectedOrder.durationUnit}</span>
                </div>
              </div>

              <Separator />

              {/* 费用明细 */}
              <div className="space-y-3">
                <div className="font-medium">费用明细</div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">订单总额</span>
                  <span className="text-sm font-medium">¥{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                {selectedOrder.voucherUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">算力券抵扣</span>
                    <span className="text-sm font-medium text-purple-400">
                      -¥{selectedOrder.voucherUsed.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedOrder.balanceUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">余额支付</span>
                    <span className="text-sm font-medium text-blue-400">
                      -¥{selectedOrder.balanceUsed.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* 时间信息 */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">创建时间</span>
                  <span className="text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                {selectedOrder.startTime && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">开始时间</span>
                    <span className="text-sm">{new Date(selectedOrder.startTime).toLocaleString()}</span>
                  </div>
                )}
                {selectedOrder.endTime && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">结束时间</span>
                    <span className="text-sm">{new Date(selectedOrder.endTime).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedOrder.remark && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-400 mb-2">备注</div>
                    <div className="text-sm bg-gray-800/50 rounded p-3">
                      {selectedOrder.remark}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
