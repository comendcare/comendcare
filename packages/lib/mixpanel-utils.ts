// var Mixpanel = require("mixpanel")

// export const initialize = () => {
//     console.log(`mixpanel token`, process.env.MIXPANEL_TOKEN_DEV)
//     console.log(`mixpanel secret`, process.env.MIXPANEL_SECRET_DEV)
//     if (process.env.MIXPANEL_SECRET_DEV && process.env.NEXT_PUBLIC_NODE_ENV === "development") {
//         try {
//             Mixpanel.init(process.env.MIXPANEL_SECRET_DEV, {
//                 debug: true,
//                 track_pageview: true,
//                 // persistence: "localStorage",
//                 // loaded: function(mixpanel) {
//                 //     const distinctId = mixpanel.get_distinct_id()
//                 //     console.log("Mixpanel distinct_id:", distinctId)
//                 //     setMixpanelContext({ distinctId })
//                 // }
//             })
//             console.log("Mixpanel (dev) initialized")
//             setIsMixpanelInitialized(true)
//         } catch (error) {
//             console.error("Mixpanel (dev) initialization failed:", error)
//         }
//     } else if (process.env.MIXPANEL_SECRET) {
//         try {
//             mixpanel.init(process.env.MIXPANEL_SECRET, {
//                 debug: false,
//                 disable_cookie: true,
//                 track_pageview: true,
//                 persistence: "localStorage",
//                 loaded: function(mixpanel) {
//                     const distinctId = mixpanel.get_distinct_id()
//                     // console.log("Mixpanel distinct_id:", distinctId)
//                     // setMixpanelContext({ distinctId })
//                 }
//             })
//             console.log("Mixpanel initialized")
//             // setIsMixpanelInitialized(true)
//         } catch (error) {
//             console.error("Mixpanel initialization failed:", error)
//         }
//     } else {
//         console.error("Mixpanel secret is not defined")
//     }
// }