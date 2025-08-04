"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Package, Clock, CheckCircle } from "lucide-react";

export default function ShipperManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shipper Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your shipping orders and track deliveries
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently being delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Ready for pickup
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest shipping orders assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Order #12345</p>
                  <p className="text-sm text-muted-foreground">123 Main St, City</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">In Transit</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Order #12344</p>
                  <p className="text-sm text-muted-foreground">456 Oak Ave, Town</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Pending Pickup</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Order #12343</p>
                  <p className="text-sm text-muted-foreground">789 Pine Rd, Village</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Delivered</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for shippers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>View All Orders</span>
              </div>
            </button>
            
            <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>My Orders</span>
              </div>
            </button>

            <button className="w-full p-3 text-left border rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Update Status</span>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 