import {BetaSignup} from "@/components/beta-signup";
import {motion} from "framer-motion";


export default function JoinWaitlistSection({isSubscribedCallback, isSubscribed}: {
    isSubscribedCallback: () => Promise<void>,
    isSubscribed: boolean
}) {

    return (
        <motion.div className="max-w-7xl mx-auto py-8 mt-8 flex flex-col justify-center items-center">
            <BetaSignup isSubscribedCallback={isSubscribedCallback} isSubscribed={isSubscribed}/>
        </motion.div>
    )
}