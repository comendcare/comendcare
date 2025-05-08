"use client"

import React, { ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedTextProps {
    children: ReactNode
}

const TextHover: React.FC<AnimatedTextProps> = ({ children }) => {
    return (
        <motion.div
            className="animated-text"
            whileHover={{
                scale: 1.01,
                fontWeight: 550
            }}
        >
            {children}
        </motion.div>
    )
}

export default TextHover