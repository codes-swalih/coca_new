"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  UserRound,
  Building,
  Megaphone,
  Gem ,
  CalendarHeart,
  ChartNoAxesCombined 

} from "lucide-react"

import cocaLogo from '../assets/images/logo.svg'

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Coca",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
        title : "Dashboard",
        name: "Design Engineering",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "#",
      icon: UserRound,
      items: [
        {
          title: "Roles",
          url: "/admin/users/roles",
        },
        {
          title: "Users",
          url: "#",
        },
      ],
    },
    {
      title: "Organization",
      url: "#",
      icon: Building,
      items: [
        {
          title: "States",
          url: "#",
        },
        {
          title: "Districts",
          url: "#",
        },
        {
          title: "Zones",
          url: "#",
        },
        {
          title: "Chapters",
          url: "#",
        },
        {
          title: "Services",
          url: "#",
        },
        {
          title: "Members",
          url: "#",
        },
        {
          title: "Clubs",
          url: "/admin/clubs",
        },
      ],
    },
    {
      title : "Members",
      name: "Design Engineering",
      url: "/admin/members",
      icon: Settings2,  // Changed from CalendarHeart to Settings2
  },
    {
        title : "Advertisements",
        name: "Design Engineering",
        url: "/admin/advertisements",
        icon: Megaphone,
    },
    {
      title : "Coca Events",
      name: "Design Engineering",
      url: "/admin/cocaevents",
      icon: CalendarHeart,
   },
    {
        title : "Events",
        name: "Design Engineering",
        url: "/admin/events",
        icon: CalendarHeart,
    },
    {
      title : "Services",
      name: "Design Engineering",
      url: "/admin/services",
      icon: Settings2,  // Changed from CalendarHeart to Settings2
  },
    
    {
        title : "Jewelries",
        name: "Design Engineering",
        url: "#",
        icon: Gem,
    },
    {
        title : "Reports & Analatiycs",
        name: "Design Engineering",
        url: "#",
        icon: ChartNoAxesCombined,
    },
    
  
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
