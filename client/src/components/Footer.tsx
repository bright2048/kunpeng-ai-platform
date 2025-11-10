import { APP_TITLE } from "@/const";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 关于我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{APP_TITLE}</h3>
            <p className="text-sm text-muted-foreground">
              AI企业全栈式赋能平台，为AI企业提供空间、硬件、软件、模型、数据、算力等全方位支持。
            </p>
          </div>

          {/* 核心服务 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">核心服务</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>空间支持</li>
              <li>硬件供给</li>
              <li>软件支撑</li>
              <li>模型服务</li>
              <li>数据服务</li>
              <li>算力保障</li>
            </ul>
          </div>

          {/* 赋能行业 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">赋能行业</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>金融AI</li>
              <li>医疗AI</li>
              <li>制造AI</li>
              <li>教育AI</li>
              <li>零售AI</li>
              <li>交通AI</li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>中国·深圳</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>400-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@kunpeng.ai</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
