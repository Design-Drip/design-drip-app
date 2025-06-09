import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ShoppingCart, User, LogOut } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const productCategories = [
  {
    title: "T-Shirts",
    href: "/products/t-shirts",
    description: "Casual everyday wear t-shirts with unique designs",
  },
  {
    title: "Sweatshirts",
    href: "/products/sweatshirts",
    description: "Comfortable sweatshirts perfect for any weather",
  },
  {
    title: "Hoodies",
    href: "/products/hoodies",
    description: "Stay warm with our designer hoodies",
  },
];

const shirtFilters = [
  { name: "Men's", href: "/products/shirts?gender=men" },
  { name: "Women's", href: "/products/shirts?gender=women" },
  { name: "New Arrivals", href: "/products/shirts?filter=new" },
  { name: "Best Sellers", href: "/products/shirts?filter=popular" },
  { name: "Sale", href: "/products/shirts?filter=sale" },
];

export default async function Header() {
  const user = await currentUser();

  return (
    <header className="border-b border-border sticky top-0 z-40 w-full bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between h-16 px-4 md:h-20 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Design Drip Logo"
              width={128}
              height={128}
            />
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    {productCategories.map((category) => (
                      <NavigationMenuLink asChild key={category.href}>
                        <Link
                          href={category.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">
                            {category.title}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {category.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                  <div className="p-4 pt-0">
                    <div className="mt-4 pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">
                        Shop by Category
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {shirtFilters.map((filter) => (
                          <Link
                            key={filter.href}
                            href={filter.href}
                            className="text-sm hover:underline"
                          >
                            {filter.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/all-products" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    All Products
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-10">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    0
                  </span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full focus-visible:ring-offset-2 p-0"
                  >
                    <Avatar>
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) ||
                          user.emailAddresses?.[0]?.emailAddress
                            ?.charAt(0)
                            ?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user.fullName || user.emailAddresses?.[0]?.emailAddress}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="w-full" asChild>
                    <Link
                      href="/settings"
                      className="flex cursor-pointer items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>My Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground w-full"
                    asChild
                  >
                    <SignOutButton>
                      <Button variant="ghost" size="sm" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </Button>
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
