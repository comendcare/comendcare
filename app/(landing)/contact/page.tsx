"use client"

import SliderToggle from "@/components/ui/slider-toggle";
import {useState} from "react";
import {InlineWidget} from "react-calendly";
import {ContactForm} from "@/components/contact-form";

type ToggleOptionsType = string

export default function ContactPage() {
    const [selected, setSelected] = useState<ToggleOptionsType>("email");

    return (
        <div
            className="container max-w-7xl mx-auto flex flex-col justify-center items-center space-y-16 px-8 py-16 md:py-24 mt-16"
        >
            <SliderToggle selected={selected} leftText={"email"} rightText={"meeting"} setSelected={setSelected}/>

            {selected === "meeting" ?
                <InlineWidget url="https://calendly.com/albertatcomend/comend-convos" styles={{height: '800px', width: '100%'}}/>
                : <ContactForm/>
            }
        </div>
    )
}