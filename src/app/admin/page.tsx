import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <Badge variant="secondary">+20.1%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+180 từ tháng trước</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
          <Badge variant="secondary">+12.5%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">234</div>
          <p className="text-xs text-muted-foreground">+19 từ tuần trước</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
          <Badge variant="secondary">+8.2%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,234</div>
          <p className="text-xs text-muted-foreground">+$2,234 từ tháng trước</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoạt động</CardTitle>
          <Badge variant="outline">Trực tuyến</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">573</div>
          <p className="text-xs text-muted-foreground">+201 từ hôm qua</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Chào mừng đến với Admin Panel</CardTitle>
          <CardDescription>
            Đây là layout có thể tái sử dụng cho nhiều role khác nhau. Bạn có thể dễ dàng thay đổi cấu hình sidebar cho
            từng role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Tính năng chính:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Layout responsive với sidebar có thể thu gọn</li>
              <li>• Cấu hình menu linh hoạt cho từng role</li>
              <li>• Breadcrumb navigation tự động</li>
              <li>• User dropdown với avatar</li>
              <li>• Badge và notification support</li>
              <li>• TypeScript support đầy đủ</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
