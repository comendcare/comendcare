import { createNotification, notificationsViewed } from "@/lib/actions"
import { getAllNotifications } from "@/lib/fetchers"
import { PlatformNotification } from "@prisma/client"
import { toast } from "sonner"
import {create} from "zustand"

export type NotificationsState = {
    notifications: PlatformNotification[],
    fetchNotifications: () => Promise<void>,
    initState: (notifications: PlatformNotification[]) => void,
    addNotification: (notification: Partial<PlatformNotification>) => Promise<void>,
    setNotificationsViewed: (notifications: PlatformNotification[]) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>()(
    (set, get) => ({
        notifications: [],
        fetchNotifications: async () => {
            console.log(`fetch notifications`)
            const response = await getAllNotifications()
            if (response.success && response.data) {
                set({notifications: response.data})
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        },
        initState: (notifications: PlatformNotification[]) => {
            console.log(`set notifications`)
            set({ notifications })
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
        setNotificationsViewed: async (notifications: PlatformNotification[]) => {
            console.log(`set notifications viewed`)
            const response = await notificationsViewed({notifications})
            if (response.success && response.data) {
                const viewedNotificationIds = response.data.map(notification => notification.id)
                set({
                    notifications: get().notifications.map(notification => {
                        if (!viewedNotificationIds.includes(notification.id)) return notification

                        const updatedNotification = response.data.find(newNotification => newNotification.id === notification.id)
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
