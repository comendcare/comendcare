import { motion } from "framer-motion";
import { Dispatch, SetStateAction } from "react";
import {FaCamera, FaEnvelope} from "react-icons/fa6";

const TOGGLE_CLASSES =
    "text-sm font-medium flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-3 md:py-1.5 transition-colors relative z-10";

type ToggleOptionsType = string;

const SliderToggle = ({
                          selected,
                          setSelected,
                          leftText,
                          rightText,
                      }: {
    selected: ToggleOptionsType;
    setSelected: Dispatch<SetStateAction<ToggleOptionsType>>;
    leftText: string;
    rightText: string;
}) => {
    return (
        <div className="relative flex w-fit items-center rounded-full">
            <button
                className={`${TOGGLE_CLASSES} ${
                    selected === leftText ? "text-white" : "text-slate-800"
                }`}
                onClick={() => {
                    setSelected(leftText);
                }}
            >
                <FaEnvelope className="relative z-10 text-lg md:text-sm"/>
                <span className="relative z-10">{leftText}</span>
            </button>
            <button
                className={`${TOGGLE_CLASSES} ${
                    selected === rightText ? "text-white" : "text-slate-800"
                }`}
                onClick={() => {
                    setSelected(rightText);
                }}
            >
                <FaCamera className="relative z-10 text-lg md:text-sm"/>
                <span className="relative z-10">{rightText}</span>
            </button>
            <div
                className={`absolute inset-0 z-0 flex ${
                    selected === rightText ? "justify-end" : "justify-start"
                }`}
            >
                <motion.span
                    layout
                    transition={{ type: "spring", damping: 15, stiffness: 250 }}
                    className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#87EBA4] to-[#87CEEB]"
                />
            </div>
        </div>
    );
};

export default SliderToggle;
