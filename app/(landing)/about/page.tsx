"use client"

import SliderToggle from "@/components/ui/slider-toggle";
import {useState} from "react";

type ToggleOptionsType = string

export default function AboutPage () {
    const [selected, setSelected] = useState<ToggleOptionsType>("email");

    return (
        <div
            className="grid h-[200px] place-content-center px-4 transition-colors"
        >
            <SliderToggle selected={selected} leftText={"email"} rightText={"meeting"} setSelected={setSelected}/>
        </div>
    )
}