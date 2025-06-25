import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@comend/components/ui/sidebar"
   
  export function PAGMarketplaceSidebar() {
    return (
      <Sidebar className="absolute" side="right">
        <SidebarHeader>
            Filters
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    )
  }
