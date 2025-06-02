import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total users</CardTitle>
          <Badge variant="secondary">+20.1%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">+180 last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <Badge variant="secondary">+12.5%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">234</div>
          <p className="text-xs text-muted-foreground">+19 last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <Badge variant="secondary">+8.2%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$12,234</div>
          <p className="text-xs text-muted-foreground">+$2,234 last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <Badge variant="outline">Online</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">573</div>
          <p className="text-xs text-muted-foreground">+201 last day</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Welcome to Admin Panel</CardTitle>
          <CardDescription>
            This is a reusable layout for different roles. You can easily change the sidebar configuration for each role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Key Features:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Responsive layout with collapsible sidebar</li>
              <li>• Flexible menu configuration for each role</li>
              <li>• Automatic Breadcrumb Navigation</li>
              <li>• User dropdown with avatar</li>
              <li>• Badge và notification support</li>
              <li>• Full TypeScript support</li>
            </ul>
          </div>
        </CardContent>
      </Card> 
    </div>
  )
}
