"use client";
import Image from "next/image";
import Link from "next/link"
import { cn } from "@/lib/utils"

import NavigationMenuDemo from "@/components/navigation-menu"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"


export default function Home() {
  return (
    <main className="">
     <NavigationMenuDemo/>

    </main>
  );
}
