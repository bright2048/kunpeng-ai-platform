import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Users, Coffee, Printer, Wifi, Car, Check } from "lucide-react";
import Navbar from "@/components/Navbar"; 

interface Floor {
  floor: number;
  total_units: number;
  available: number;
  occupied: number;
  total_area: number;
  available_area: number;
}

interface SpaceUnit {
  id: number;
  floor: number;
  unit_number: string;
  area: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  status: 'available' | 'occupied' | 'reserved';
  price_per_month: number;
}

interface Facility {
  id: number;
  name: string;
  icon: string;
  price: number;
}

const iconMap: Record<string, any> = {
  building: Building2,
  users: Users,
  coffee: Coffee,
  printer: Printer,
  wifi: Wifi,
  car: Car,
};

export default function SpaceBooking() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [units, setUnits] = useState<SpaceUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<SpaceUnit | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // 加载楼层信息
  useEffect(() => {
    fetch("/api/space/floors")
      .then((res) => res.json())
      .then((data) => setFloors(data))
      .catch(() => toast.error("加载楼层信息失败"));
  }, []);

  // 加载配套设施
  useEffect(() => {
    fetch("/api/space/facilities")
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch(() => toast.error("加载配套设施失败"));
  }, []);

  // 加载空间单元
  useEffect(() => {
    if (selectedFloor) {
      fetch(`/api/space/floors/${selectedFloor}/units`)
        .then((res) => res.json())
        .then((data) => setUnits(data))
        .catch(() => toast.error("加载空间信息失败"));
    }
  }, [selectedFloor]);

  // 计算总价
  const calculateTotal = () => {
    if (!selectedUnit || !startDate || !endDate) return 0;
    
    const months = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24 * 30)
    );
    
    let total = selectedUnit.price_per_month * months;
    
    selectedFacilities.forEach((fid) => {
      const facility = facilities.find((f) => f.id === fid);
      if (facility) total += facility.price * months;
    });
    
    return total;
  };

  // 提交订单
  const handleSubmit = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("请先登录");
      return;
    }

    const user = JSON.parse(userStr);

    if (!selectedUnit || !startDate || !endDate) {
      toast.error("请完整填写信息");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/space/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          spaceUnitId: selectedUnit.id,
          startDate,
          endDate,
          facilities: selectedFacilities,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("订单创建成功！");
        // 重新加载数据
        setSelectedUnit(null);
        setSelectedFacilities([]);
        setStartDate("");
        setEndDate("");
        // 刷新楼层数据
        const res = await fetch(`/api/space/floors/${selectedFloor}/units`);
        const newUnits = await res.json();
        setUnits(newUnits);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("创建订单失败");
    } finally {
      setLoading(false);
    }
  };

  const currentFloor = floors.find((f) => f.floor === selectedFloor);

  return (
    <>
     <Navbar />
      <p>
        </p>
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">空间预订</h1>
        <p className="text-gray-400 mb-8">
          总面积 40,000㎡ | 16层楼宇 | 每层约 2,500㎡
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：楼层选择和平面图 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 楼层选择 */}
            <Card>
              <CardHeader>
                <CardTitle>选择楼层</CardTitle>
                <CardDescription>点击查看该楼层空间分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {floors.map((floor) => (
                    <Button
                      key={floor.floor}
                      variant={selectedFloor === floor.floor ? "default" : "outline"}
                      onClick={() => setSelectedFloor(floor.floor)}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg font-bold">{floor.floor}F</span>
                      <span className="text-xs">
                        空闲 {floor.available}/{floor.total_units}
                      </span>
                    </Button>
                  ))}
                </div>

                {currentFloor && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">总单元</div>
                        <div className="text-xl font-bold">{currentFloor.total_units}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">空闲</div>
                        <div className="text-xl font-bold text-green-500">
                          {currentFloor.available}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">已占用</div>
                        <div className="text-xl font-bold text-red-500">
                          {currentFloor.occupied}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 平面图 */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedFloor}F 平面图</CardTitle>
                <CardDescription>
                  <span className="inline-block w-4 h-4 bg-green-500 mr-2"></span>空闲
                  <span className="inline-block w-4 h-4 bg-red-500 mx-2"></span>已占用
                  <span className="inline-block w-4 h-4 bg-yellow-500 mx-2"></span>已预订
                  <span className="inline-block w-4 h-4 bg-blue-500 mx-2"></span>已选中
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-800 rounded-lg p-4" style={{ height: "500px" }}>
                  <svg width="100%" height="100%" viewBox="0 0 1000 300">
                    {units.map((unit) => {
                      const isSelected = selectedUnit?.id === unit.id;
                      const color =
                        isSelected ? "#3b82f6" :
                        unit.status === "available" ? "#22c55e" :
                        unit.status === "reserved" ? "#eab308" :
                        "#ef4444";

                      return (
                        <g
                          key={unit.id}
                          onClick={() => {
                            if (unit.status === "available") {
                              setSelectedUnit(unit);
                            }
                          }}
                          style={{ cursor: unit.status === "available" ? "pointer" : "not-allowed" }}
                        >
                          <rect
                            x={unit.position_x}
                            y={unit.position_y}
                            width={unit.width}
                            height={unit.height}
                            fill={color}
                            stroke="#fff"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                          <text
                            x={unit.position_x + unit.width / 2}
                            y={unit.position_y + unit.height / 2 - 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="14"
                            fontWeight="bold"
                          >
                            {unit.unit_number}
                          </text>
                          <text
                            x={unit.position_x + unit.width / 2}
                            y={unit.position_y + unit.height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="12"
                          >
                            {unit.area}㎡
                          </text>
                          <text
                            x={unit.position_x + unit.width / 2}
                            y={unit.position_y + unit.height / 2 + 30}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="11"
                          >
                            ¥{unit.price_per_month}/月
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：订单信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>订单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUnit ? (
                  <>
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">单元编号</span>
                        <span className="font-bold">{selectedUnit.unit_number}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">面积</span>
                        <span className="font-bold">{selectedUnit.area}㎡</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">月租金</span>
                        <span className="font-bold text-green-500">
                          ¥{selectedUnit.price_per_month}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label>租赁开始日期</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label>租赁结束日期</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">配套设施</Label>
                      <div className="space-y-2">
                        {facilities.map((facility) => {
                          const Icon = iconMap[facility.icon] || Building2;
                          const isChecked = selectedFacilities.includes(facility.id);
                          
                          return (
                            <div
                              key={facility.id}
                              className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedFacilities(selectedFacilities.filter((id) => id !== facility.id));
                                } else {
                                  setSelectedFacilities([...selectedFacilities, facility.id]);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox checked={isChecked} />
                                <Icon className="w-5 h-5" />
                                <span>{facility.name}</span>
                              </div>
                              <span className="text-sm text-gray-400">
                                +¥{facility.price}/月
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {startDate && endDate && (
                      <div className="p-4 bg-blue-900/30 border border-blue-500 rounded-lg">
                        <div className="flex items-center justify-between text-lg font-bold">
                          <span>总计</span>
                          <span className="text-blue-400">¥{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !startDate || !endDate}
                      className="w-full"
                    >
                      {loading ? "提交中..." : "提交订单"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    请在左侧平面图中选择空间
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
