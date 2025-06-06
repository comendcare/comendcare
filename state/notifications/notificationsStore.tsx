import { createNotification, createNotifications, notificationsViewed } from "@/lib/actions"
import { getAllNotifications } from "@/lib/fetchers"
import { PlatformNotification } from "@prisma/client"
import { toast } from "sonner"
import {create} from "zustand"

export type NotificationsState = {
    initialized: boolean,
    notifications: PlatformNotification[],
    fetchNotifications: () => Promise<void>,
    initState: (notifications: PlatformNotification[]) => void,
    addNotification: (notification: Partial<PlatformNotification>) => Promise<void>,
    addNotifications: (notifications: Partial<PlatformNotification>[]) => Promise<void>,
    setNotificationsViewed: (notifications: PlatformNotification[]) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>()(
    (set, get) => ({
        initialized: false,
        notifications: [],
        fetchNotifications: async () => {
            console.log(`fetch notifications`)
            const response = await getAllNotifications({
                id: true,
                type: true,
                title: true,
                message: true,
                link: true,
                createdAt: true,
                updatedAt: true,
                lastViewedAt: true,
            })
            if (response.success && response.data) {
                set({notifications: response.data})
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        },
        initState: (notifications: PlatformNotification[]) => {
            console.log(`set notifications`)
            set({ notifications, initialized: true })
        },
        addNotification: async (notification: Partial<PlatformNotification>) => {
            console.log(`add notification`)
            const response = await createNotification({ notificationData: notification })
            if (response.success && response.data) {
                set({notifications: [...get().notifications, response.data]})
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        },
        addNotifications: async (notifications: Partial<PlatformNotification>[]) => {
            console.log(`add notifications`)
            const response = await createNotifications({ notificationsList: notifications })
            if (response.success && response.data) {
                set({notifications: [...get().notifications, ...response.data]})
            }
        },
        setNotificationsViewed: async (notifications: PlatformNotification[]) => {
            console.log(`set notifications viewed`, notifications)
            const response = await notificationsViewed({notifications})
            if (response.success && response.data) {
                const viewedNotificationIds = response.data.map((notification: any) => notification.id)
                set({
                    notifications: get().notifications.map(notification => {
                        if (!viewedNotificationIds.includes(notification.id)) return notification

                        const updatedNotification = response.data.find((newNotification: any) => newNotification.id === notification.id)
                        if (!updatedNotification) return notification

                        return {
                            ...notification,
                            lastViewedAt: updatedNotification.lastViewedAt
                        }
                    })
                })
            }
        }
    }))
