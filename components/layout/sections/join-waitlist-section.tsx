import {BetaSignup} from "@/components/beta-signup";
import {motion} from "framer-motion";


export default function JoinWaitlistSection({isSubscribedCallback, isSubscribed}: {
    isSubscribedCallback: () => Promise<void>,
    isSubscribed: boolean
}) {

    return (
        <motion.div 
            className="max-w-7xl mx-auto py-8 mt-8 flex flex-col justify-center items-center"
            initial={{opacity: 0, y: 50}}
            animate={{opacity: 1, y: [50, -10, 0]}}
            transition={{duration: 0.8, ease: [0.4, 0.0, 0.2, 1]}}
        >
            <BetaSignup isSubscribedCallback={isSubscribedCallback} isSubscribed={isSubscribed}/>
        </motion.div>
    )
}