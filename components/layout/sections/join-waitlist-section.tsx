import { BetaSignup } from "@/components/beta-signup";
import { motion } from "framer-motion";

export default function JoinWaitlistSection({
                                                isSubscribedCallback,
                                                isSubscribed,
                                            }: {
    isSubscribedCallback: () => Promise<void>;
    isSubscribed: boolean;
}) {

    return (
        <motion.div
            className="max-w-7xl mx-auto py-8 mt-8 flex flex-col justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: [50, -10, 0] }}
            transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
            role="region"
            aria-labelledby="waitlist-header"
        >
            {/* Adding aria-live for dynamic updates */}
            <h2 id="waitlist-header" className="sr-only">
                Join the Waitlist
            </h2>

            <div aria-live="polite" aria-atomic="true">
                <BetaSignup
                    isSubscribedCallback={isSubscribedCallback}
                    isSubscribed={isSubscribed}
                />
            </div>
        </motion.div>
    );
}
