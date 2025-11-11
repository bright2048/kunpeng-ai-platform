import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { Search, FileText, Package, CreditCard } from "lucide-react";
import { useState } from "react";

export default function BillingCenter() {
  const [orders, setOrders] = useState<any[]>([]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">费用中心</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧导航 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-400 mb-2">订单管理</div>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      待支付订单
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      待续费产品
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      未读消息
                    </Button>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">伙伴中心</div>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      云商店卖家中心
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      云商店买家中心
                    </Button>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">实时客服</div>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">工单管理</div>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">开发者空间</div>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">个性化推荐管理</div>

                    <div className="text-sm font-semibold text-gray-400 mb-2 mt-4">退出登录</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧内容 */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>我的订单</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 提示信息 */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300">
                      本页面提供依赖当前业务，普遍仅显示包年包月订单业务，请查看{" "}
                      <Button variant="link" className="h-auto p-0 text-blue-400">
                        回收站
                      </Button>
                      、
                      <Button variant="link" className="h-auto p-0 text-blue-400">
                        新控制台订单列表
                      </Button>
                    </p>
                  </div>

                  {/* 筛选栏 */}
                  <Tabs defaultValue="all" className="mb-6">
                    <TabsList>
                      <TabsTrigger value="all">全部</TabsTrigger>
                      <TabsTrigger value="cloud">云服务</TabsTrigger>
                      <TabsTrigger value="hardware">硬件</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="sm">
                      导出全部
                    </Button>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">近1个月</SelectItem>
                        <SelectItem value="3months">近3个月</SelectItem>
                        <SelectItem value="6months">近6个月</SelectItem>
                        <SelectItem value="1year">近1年</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1">
                      <Input
                        placeholder="多个订单号请以逗号或空格分隔"
                        className="w-full"
                      />
                    </div>
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      搜索
                    </Button>
                  </div>

                  {/* 订单列表 */}
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                      <p className="text-gray-400 text-lg mb-2">暂无相关数据</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* 订单项示例 */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Package className="w-8 h-8 text-blue-500" />
                              <div>
                                <div className="font-semibold">订单号：#12345678</div>
                                <div className="text-sm text-gray-400">2024-01-15 10:30:00</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">¥1,200.00</div>
                              <div className="text-sm text-green-500">已支付</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
