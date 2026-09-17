"use client";

import { Home, BriefcaseBusiness, Mail } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

export type TabId = "home" | "companies" | "socials" | "contact";
const items = [
  { id: "home", title: "home", Icon: Home },
  { id: "companies", title: "founded", Icon: BriefcaseBusiness },
  { id: "contact", title: "contact", Icon: Mail },
] as const;

export default function BottomNavigation({ activeTab = "home", onTabChange }: { activeTab?: TabId; onTabChange: (tab: TabId) => void }) {
  return <div className="site-dock">
    <Dock className="items-end pb-[7px]" panelHeight={56} magnification={60} distance={120} aria-label="Main navigation">
      {items.map(({ id, title, Icon }) => <DockItem key={id} className="aspect-square rounded-full" aria-label={title} aria-current={activeTab === id ? "page" : undefined} onClick={() => onTabChange(id)}>
        <DockLabel>{title}</DockLabel>
        <DockIcon><Icon className="h-full w-full" strokeWidth={1.25} /></DockIcon>
      </DockItem>)}
    </Dock>
  </div>;
}
