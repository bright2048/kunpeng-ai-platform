import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Industries from "./pages/Industries";
import Login from "./pages/Login";
import SpaceBooking from "./pages/SpaceBooking";
import AccountCenter from "./pages/AccountCenter";
import BillingCenter from "./pages/BillingCenter";
import ComputingPower from "./pages/ComputingPower";
import AdminGPU from "./pages/AdminGPU";
import AdminUsers from "./pages/AdminUsers";
import HardwareSupply from "./pages/HardwareSupply";
import HardwareDetail from "./pages/HardwareDetail";
import AdminHardware from "./pages/AdminHardware";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVouchers from "./pages/AdminVouchers";
import AdminDiscounts from "./pages/AdminDiscounts";
import Tickets from "./pages/Tickets";
import OrderDetail from "./pages/OrderDetail";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/space-booking"} component={SpaceBooking} />

      {/* 服务页面 */}
      <Route path={"/services/computing"} component={ComputingPower} />
      <Route path={"/services/hardware"} component={HardwareSupply} />
      <Route path={"/hardware/:id"} component={HardwareDetail} />
      <Route path={"/services/:category"} component={Services} />

      {/* 用户中心 */}
      <Route path={"/account"} component={AccountCenter} />
      <Route path={"/billing"} component={BillingCenter} />
      <Route path={"/tickets"} component={Tickets} />

      {/* 管理员后台 */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/gpu"} component={AdminGPU} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/hardware"} component={AdminHardware} />
      <Route path={"/admin/vouchers"} component={AdminVouchers} />
      <Route path={"/admin/discounts"} component={AdminDiscounts} />

      {/* 其他页面 */}
      <Route path={"/industries"} component={Industries} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/orders/:id"} component={OrderDetail} />

      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
