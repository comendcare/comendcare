import * as React from "react"
import {cn, getStatusColor, getStatusText} from "@comend/lib/utils";
import {EllipsisVertical} from "lucide-react";
import {InfiniteMovingCards} from "@comend/components/ui/infinite-moving-cards";
import Balancer from "react-wrap-balancer";
import {Checkbox} from "@comend/components/ui/checkbox"
import {RadioGroup, RadioGroupItem} from "@comend/components/ui/radio-group"
import {Label} from "@comend/components/ui/label"
import {Input} from "@comend/components/ui/input"
import {Textarea} from "@comend/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip"
import Image from "next/image";
import researcherProfileScreenshot from "@/public/screenshots/researcher-profile-screenshot.png"


export default function ResearcherMainFeatures() {
    const words = "Biosamples galore".split(" ");

    return (
        <div className="bg-[#FFFFFF] w-full flex max-w-7xl flex-col lg:flex-row items-center mx-auto p-8 gap-y-8 gap-x-8">
            {/* <div
                className="bg-[#FFFFFF] h-[460px] w-full lg:w-2/5 flex flex-col items-stretch rounded-[26px] p-5 border overflow-hidden"
            >
                <div className="relative flex flex-col h-full">
                    <div className="flex flex-col items-center flex-none">
                        <h1 className="text-xl md:text-4xl font-semibold tracking-tight text-center">
                            {words.map((word, index) => (
                                <React.Fragment key={index}>
                                    <span className="inline-block">{word}</span>
                                    {index < words.length - 1 && " "}
                                </React.Fragment>
                            ))}
                        </h1>
                        <div className="text-center text-sm mt-2 md:mt-4">
                            Biosamples for any and all use cases, made discoverable with search,
                            filter, and sort.
                        </div>
                    </div>

                    <div className="w-full flex-1 min-h-0 mt-4">
                        <SkeletonFour />
                    </div>
                </div>
            </div> */}

            {/* <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <div className="h-[460px] w-full flex flex-col items-center">
                        <div className="bg-[#FFFFFF] h-full w-full flex flex-col items-center rounded-[26px] p-5 border overflow-hidden">
                            <div className="relative w-full h-[293px] mt-5 flex flex-col items-center">
                                <div className="absolute -left-[70px] scale-125 top-7 rotate-[12deg]">
                                    <Analytics color="#DFEBF3" />
                                </div>
                                <div className="absolute -right-[70px] scale-125 top-7 rotate-[-20deg]">
                                    <Analytics color="#DFEBF3" />
                                </div>

                                <div className="space-y-3 z-10">
                                    {[
                                        {
                                            avatar: 1,
                                            name: "Request for biosample A",
                                            description: "For study on effects...",
                                            status: "ACCEPTED",
                                        },
                                        {
                                            avatar: 2,
                                            name: "Request for dataset X",
                                            description: "For ablation study...",
                                            status: "REQUESTED",
                                        },
                                        {
                                            avatar: 3,
                                            name: "Request for clinical model",
                                            description: "To test efficacy...",
                                            status: "SHIPPED",
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="relative flex items-center justify-between p-2 lg:p-4 lg:w-[400px] w-[270px] h-20 bg-white border rounded-xl shadow-[0px_3px_8px_-1px_#3232470D,0px_0px_1px_0px_#0C1A4B3D]"
                                        >
                                            <div className="flex items-center">
                                                <div className="grid ml-4">
                                                    <h1 className="font-semibold text-sm">{item.name}</h1>
                                                    <p className="font-normal text-xs">{item.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-row items-center justify-between gap-x-2">
                                                <div
                                                    className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded border transition-colors",
                                                        getStatusColor(item.status)
                                                    )}
                                                >
                                                    {getStatusText(item.status)}
                                                </div>
                                                <EllipsisVertical />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <ContentCard
                                    title="Track request status"
                                    description="All the features you need to collaborate on sample and data requests"
                                    className="mt-8"
                                />
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>

                <TooltipContent className="text-lg">
                    🎉 Coming soon!
                </TooltipContent>
            </Tooltip> */}

            <div className="h-fit w-full flex flex-col items-center">
                <div className="bg-[#FFFFFF] w-full flex flex-col items-center rounded-[26px] p-5 border overflow-hidden">
                    <div className="relative w-full h-fit mt-5 flex flex-col items-center">
                        <div className="space-y-3 z-10">
                                <Image
                                    src={researcherProfileScreenshot}
                                    alt="Researcher profile screenshot"
                                    height={500}
                                    className="rounded-[20px]"
                                />
                        </div>

                        <ContentCard
                            title="Researcher profiles"
                            description="Complete your researcher profile to join the Comend marketplace."
                            className="mt-8"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ContentCard: React.FC<{
    className?: string;
    title?: string;
    description?: string;
}> = ({
          className,
          title = "Go from question to",
          description = `All the features of product feedback tool you need to easily centralize
        product`,
      }) => {
    const words = title.split(" ");

    return (
        <div className={cn("flex flex-col items-center", className)}>
            <h1 className="text-xl md:text-4xl font-semibold tracking-tight text-center">
                {words.map((word, index) => (
                    <React.Fragment key={index}>
                        <span className="inline-block">{word}</span>
                        {index < words.length - 1 && " "}
                    </React.Fragment>
                ))}
            </h1>
            <p className="text-center text-sm md:w-[70%] w-full mt-2 md:mt-4">
                {description}
            </p>
        </div>
    );
};

const Analytics: React.FC<{
    className?: string;
    color: string;
}> = ({className, color}) => {
    return (
        <div className="md:[&>*]:scale-100 [&>*]:scale-75">
            <div
                className={cn(
                    "w-[220px] h-[262px] rounded-2xl overflow-hidden bg-[#FFFFFF]",
                    "shadow-[0px_7px_15px_0px_#3333331A,0px_27px_27px_0px_#33333317,0px_60px_36px_0px_#3333330D,0px_106px_43px_0px_#33333303,0px_166px_47px_0px_#33333300]",
                    className
                )}
            >
                <div
                    className={
                        "h-10 font-normal text-sm flex items-center p-4 text-neutral-700"
                    }
                    style={{
                        backgroundColor: color,
                    }}
                >
                    Sample Request
                </div>
                <div className="p-2 space-y-2">
                    <div className="px-1">
                        <div className="flex flex-col items-start justify-start space-y-2">
                            <p className="text-base -mb-1.5 truncate whitespace-nowrap overflow-hidden w-full">
                                Is this study funded by a commercial entity (e.g., pharma, biotech, industry-sponsored
                                research)?
                            </p>
                            <RadioGroup
                                className="flex flex-row space-x-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={""}/>
                                    <Label htmlFor="commercial-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={""}/>
                                    <Label htmlFor="commercial-no">No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="px-1">
                        <div className="flex flex-col items-start justify-start space-y-2">
                            <p className="text-base -mb-1.5 truncate whitespace-nowrap overflow-hidden w-full">
                                Request Title
                            </p>
                            <Input/>
                        </div>
                    </div>
                    <div className="px-1">
                        <div className="flex flex-row items-center justify-center space-x-2">
                            <Checkbox/>
                            <p className="text-base -mb-1.5 truncate whitespace-nowrap overflow-hidden w-full">
                                I agree to acknowledge the organization in publications and provide updates on research
                                progress.
                            </p>
                        </div>
                        <label className="text-xs text-neutral-700">18:30 | Remote</label>
                    </div>
                    <div className="px-1">
                        <div className="flex flex-col items-start justify-start space-y-2">
                            <p className="text-base -mb-1.5 truncate whitespace-nowrap overflow-hidden w-full">
                                Dissemination plan of analysis and findings
                            </p>
                            <Textarea
                                rows={3}
                                placeholder="Describe how you plan to disseminate your findings..."
                            />
                        </div>
                        <label className="text-xs text-neutral-700">
                            18:30 | Remote
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const SkeletonFour = () => {
    return (
        <div className="h-full  flex flex-col items-center relative bg-white dark:bg-black mt-10">
            <InfiniteMovingCards speed="fast" direction="left">
                <MovingGrid/>
            </InfiniteMovingCards>
            <InfiniteMovingCards speed="slow" direction="right">
                <MovingGrid/>
            </InfiniteMovingCards>
            <InfiniteMovingCards speed="normal" direction="left">
                <MovingGrid/>
            </InfiniteMovingCards>
        </div>
    );
};

const MovingGrid = () => {
    return (
        <div className="flex space-x-4 flex-shrink-0 mb-4 relative z-40">
      <span
          className={cn(
              " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
          )}
      >
<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M37.5 15C39.9853 15 42 12.9853 42 10.5C42 8.01472 39.9853 6 37.5 6C35.0147 6 33 8.01472 33 10.5C33 12.9853 35.0147 15 37.5 15ZM29.254 23.2772C29.2735 22.9954 29.2981 22.6872 29.3263 22.3621C28.7388 22.7568 28.3151 23.0574 27.9364 23.3779C27.3787 23.8498 26.9211 24.3708 26.2777 25.4431L25.9754 25.9469C26.5242 26.3826 27.0694 26.7757 27.5195 27.0861C27.8195 27.2929 28.0717 27.4592 28.2469 27.5726C28.3345 27.6292 28.4025 27.6724 28.4473 27.7007L28.4965 27.7316L28.5081 27.7387C28.894 27.9765 29.188 28.3386 29.3413 28.7652L33.1362 39.3234C33.5098 40.3629 32.97 41.5084 31.9306 41.882C30.8911 42.2556 29.7456 41.7158 29.372 40.6763L25.8063 30.7557C25.6449 30.649 25.4567 30.5224 25.2489 30.3791C24.5797 29.9177 23.6842 29.2667 22.8183 28.5294C21.9767 27.8127 21.0532 26.923 20.4213 25.975C19.8678 25.1448 19.0628 23.53 19.9973 21.9115C22.7224 17.1914 25.6249 14.9697 28.1264 14.1021C29.3625 13.6735 30.465 13.5902 31.3321 13.6852C31.7556 13.7317 32.1668 13.8256 32.5281 13.9739C32.6991 14.0441 32.9352 14.1574 33.1673 14.3375C33.2826 14.427 33.4549 14.5775 33.6136 14.8002C33.7648 15.0123 34 15.4272 34 15.9999C34.0001 16.1732 33.9691 16.4646 33.9488 16.655L33.9451 16.6902C33.9166 16.9583 33.8767 17.317 33.8307 17.7291L33.8105 17.9096C33.721 18.7092 33.6108 19.695 33.5083 20.6775C33.3976 21.7399 33.2984 22.775 33.2444 23.5536C33.2382 23.6442 33.2326 23.7294 33.2278 23.8092C33.3722 23.8988 33.551 24.0093 33.7687 24.1437L33.7703 24.1447L33.7713 24.1453C34.394 24.53 35.3345 25.111 36.694 25.9607C37.6306 26.5461 37.9154 27.78 37.3299 28.7167C36.7445 29.6534 35.5106 29.9381 34.5739 29.3527C33.2101 28.5003 32.3313 27.9575 31.7192 27.5795L31.7179 27.5786C31.4225 27.3962 31.1894 27.2522 30.9938 27.1303C30.4518 26.7924 30.1678 26.6109 29.8399 26.283C29.448 25.8911 29.3284 25.4459 29.3021 25.3479L29.3004 25.3415C29.2556 25.1762 29.2363 25.0305 29.2267 24.9416C29.2067 24.7569 29.2031 24.5683 29.2035 24.415C29.2044 24.0953 29.2249 23.6974 29.254 23.2772ZM13.5 42H22C22 40.6193 21.5 37 13.5 37C9.35786 37 6 38.1193 6 39.5C6 40.8807 9.35786 42 13.5 42ZM18.1385 29.0463C18.6357 29.2868 18.8437 29.8848 18.6032 30.3819L16.4002 34.9355C16.1597 35.4326 15.5616 35.6407 15.0645 35.4002C14.5673 35.1596 14.3593 34.5616 14.5998 34.0645L16.8028 29.5109C17.0434 29.0138 17.6414 28.8057 18.1385 29.0463ZM21.9013 33.4335C22.1406 32.9358 21.9311 32.3383 21.4334 32.099C20.9357 31.8596 20.3382 32.0691 20.0988 32.5668L18.8753 35.1114C18.6359 35.6092 18.8454 36.2067 19.3431 36.446C19.8409 36.6853 20.4384 36.4759 20.6777 35.9781L21.9013 33.4335Z"
      fill="currentColor"/>
</svg>
        <span>Stool Samples</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
       <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M6.87868 6.87868C6.33579 7.42157 6 8.17157 6 9V14H8.1377C8.13775 14.0441 8.13924 14.0884 8.14222 14.133L9.87555 40.133C9.94559 41.1836 10.8182 42 11.8711 42H35.1289C36.1818 42 37.0544 41.1836 37.1245 40.133L38.8578 14.133C38.8608 14.0884 38.8623 14.0441 38.8623 14H42V9C42 8.1115 41.6137 7.31321 41 6.76389C40.9878 6.75302 40.9756 6.74224 40.9633 6.73156C40.7578 6.5536 40.528 6.40309 40.2794 6.28571C40.2426 6.26833 40.2054 6.25167 40.1677 6.23575C39.8088 6.08395 39.4142 6 39 6H9C8.54237 6 8.10866 6.10247 7.72059 6.28571C7.7135 6.28906 7.70643 6.29243 7.69938 6.29583C7.44407 6.41885 7.20886 6.57695 7 6.76389C6.9585 6.80103 6.91805 6.83931 6.87868 6.87868ZM36.8622 14H10.1378L10.4045 18H21C22.1046 18 23 18.8954 23 20V22H36.3289L36.8622 14ZM11.1142 20L11.892 34H21V20H11.1142ZM11 11.7143H9V8.28571H11V11.7143ZM15 8.28571H13V11.7143H15V8.28571ZM19 11.7143H17V8.28571H19V11.7143ZM23 8.28571H21V11.7143H23V8.28571ZM27 11.7143H25V8.28571H27V11.7143ZM31 8.28571H29V11.7143H31V8.28571ZM35 11.7143H33V8.28571H35V11.7143ZM39 8.28571H37V11.7143H39V8.28571Z"
      fill="currentColor"/>
</svg>
        <span>Urine Samples</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
<svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M4 24C7 18.5453 15.2 10.2545 24 14.1818C33 9.81822 41 18.5454 44 24C41 28.3636 32.8 36 24 36C15.2 36 7 28.3636 4 24ZM9.30929 23.5229C12.4149 22.4731 18.1843 21 24 21C29.7472 21 35.4492 22.4386 38.5799 23.4856C39.0367 23.6384 39.0113 24.2838 38.55 24.4225L38.5245 24.4302C35.5004 25.3398 29.9805 27 24 27C17.9208 27 12.3174 25.3748 9.32775 24.4265C8.88033 24.2845 8.86462 23.6732 9.30929 23.5229Z"
      fill="currentColor"/>
</svg>
        <span>Buccal Swabs</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M35 9.22967V6H33V9H15V6H13V9.22967C13 14.6524 15.5895 19.6466 19.8037 22.7875C20.4275 22.3933 21.0782 22.0334 21.7536 21.7107C19.8831 20.4891 18.329 18.8727 17.1851 17H30.8149C29.2395 19.5789 26.8863 21.6719 24 22.9172C23.9947 22.9194 23.9894 22.9217 23.9841 22.924C23.8665 22.9746 23.748 23.0238 23.6286 23.0715C22.9531 23.3417 22.302 23.6524 21.6777 24C16.8813 26.6708 13.6672 31.5245 13.0925 37H13V38.7703V39V42H15V39H33V42H35V39V38.7703V37H34.9075C34.4113 32.2723 31.9474 28.0082 28.1963 25.2125C27.5725 25.6067 26.9218 25.9666 26.2464 26.2893C28.1169 27.5109 29.671 29.1273 30.8149 31H17.1851C18.7605 28.4211 21.1137 26.3281 24 25.0828C24.0053 25.0806 24.0106 25.0783 24.0159 25.076C24.1335 25.0254 24.252 24.9762 24.3714 24.9285C25.0469 24.6583 25.698 24.3476 26.3223 24C31.63 21.0445 35 15.4159 35 9.22967ZM31.8385 33H16.1615C15.6308 34.2636 15.2711 35.608 15.1051 37H32.8949C32.7289 35.608 32.3692 34.2636 31.8385 33ZM16.1615 15H31.8385C32.3692 13.7364 32.7289 12.392 32.8949 11H15.1051C15.2711 12.392 15.6308 13.7364 16.1615 15Z"
      fill="currentColor"/>
</svg>
        <span>DNA Samples</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
       <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M39 13C37.3431 13 36 14.3431 36 16V18H42V16C42 14.3431 40.6569 13 39 13ZM42 20H36V36.5L39 41L42 36.5V20Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M6 9V38.9992C6 40.6561 7.34315 41.9992 9 41.9992H31C32.6569 41.9992 34 40.6561 34 38.9992V9C34 7.34315 32.6569 6 31 6H9C7.34315 6 6 7.34314 6 9ZM20 15C20 14.4477 20.4477 14 21 14H29C29.5523 14 30 14.4477 30 15C30 15.5523 29.5523 16 29 16H21C20.4477 16 20 15.5523 20 15ZM21 18C20.4477 18 20 18.4477 20 19C20 19.5523 20.4477 20 21 20H29C29.5523 20 30 19.5523 30 19C30 18.4477 29.5523 18 29 18H21ZM20 28C20 27.4477 20.4477 27 21 27H29C29.5523 27 30 27.4477 30 28C30 28.5523 29.5523 29 29 29H21C20.4477 29 20 28.5523 20 28ZM21 31C20.4477 31 20 31.4477 20 32C20 32.5523 20.4477 33 21 33H29C29.5523 33 30 32.5523 30 32C30 31.4477 29.5523 31 29 31H21ZM12 28V31H15V28H12ZM11 26H16C16.5523 26 17 26.4477 17 27V32C17 32.5523 16.5523 33 16 33H11C10.4477 33 10 32.5523 10 32V27C10 26.4477 10.4477 26 11 26ZM17.7071 15.7071C18.0976 15.3166 18.0976 14.6834 17.7071 14.2929C17.3166 13.9024 16.6834 13.9024 16.2929 14.2929L13 17.5858L11.7071 16.2929C11.3166 15.9024 10.6834 15.9024 10.2929 16.2929C9.90237 16.6834 9.90237 17.3166 10.2929 17.7071L13 20.4142L17.7071 15.7071Z"
      fill="currentColor"/>
</svg>
        <span>Natural History Studies</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 px-2 py-1 bg-white dark:bg-neutral-900 text-sm rounded-md flex justify-center items-center  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
               <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M39.9886 38H35.9774C35.9775 37.8505 35.9438 37.6987 35.8727 37.5556L31.642 29.0509L44 29.9311V34C44 36.2091 42.204 38 39.9886 38ZM36.8199 33.8021C37.3737 33.8021 37.8227 33.3544 37.8227 32.8021C37.8227 32.2498 37.3737 31.8021 36.8199 31.8021C36.266 31.8021 35.817 32.2498 35.817 32.8021C35.817 33.3544 36.266 33.8021 36.8199 33.8021Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M33.2097 20.0273L31.2535 27.0182L44 27.926V19.093L33.8071 19.9978L33.2097 20.0273ZM35.817 24.8021C35.817 25.3544 35.368 25.8021 34.8141 25.8021C34.2603 25.8021 33.8113 25.3544 33.8113 24.8021C33.8113 24.2498 34.2603 23.8021 34.8141 23.8021C35.368 23.8021 35.817 24.2498 35.817 24.8021Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M18.1397 27.8758L29.142 27.1223L31.0982 20.1314L16.1785 20.8672L18.1397 27.8758ZM23.7827 25.8021C24.3366 25.8021 24.7856 25.3544 24.7856 24.8021C24.7856 24.2498 24.3366 23.8021 23.7827 23.8021C23.2288 23.8021 22.7798 24.2498 22.7798 24.8021C22.7798 25.3544 23.2288 25.8021 23.7827 25.8021Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M29.4311 29.1073L18.232 29.8742L15.9583 38H33.8548L29.4311 29.1073ZM25.606 34C26.1599 34 26.6089 33.5523 26.6089 33C26.6089 32.4477 26.1599 32 25.606 32C25.0522 32 24.6032 32.4477 24.6032 33C24.6032 33.5523 25.0522 34 25.606 34Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M14.1246 20.9685L16.0856 27.9768L4 27.0801V19.0456L13.3816 21.0051L14.1246 20.9685ZM10.9081 24.2023C10.9081 24.7546 10.4591 25.2023 9.90526 25.2023C9.3514 25.2023 8.9024 24.7546 8.9024 24.2023C8.9024 23.65 9.3514 23.2023 9.90526 23.2023C10.4591 23.2023 10.9081 23.65 10.9081 24.2023Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M16.1187 29.9848L4 29.0857V34C4 36.2091 5.79598 38 8.01143 38H13.914C13.914 37.9112 13.926 37.8209 13.9511 37.7312L16.1187 29.9848ZM11.9085 34.3668C12.4624 34.3668 12.9114 33.9191 12.9114 33.3668C12.9114 32.8145 12.4624 32.3668 11.9085 32.3668C11.3547 32.3668 10.9057 32.8145 10.9057 33.3668C10.9057 33.9191 11.3547 34.3668 11.9085 34.3668Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M44 17.0851L33.6686 18.0022L33.2461 18.023L31.0011 10H39.9886C42.204 10 44 11.7909 44 14V17.0851ZM38.8256 14.8021C38.8256 15.3544 38.3766 15.8021 37.8227 15.8021C37.2689 15.8021 36.8199 15.3544 36.8199 14.8021C36.8199 14.2498 37.2689 13.8021 37.8227 13.8021C38.3766 13.8021 38.8256 14.2498 38.8256 14.8021Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M31.1921 18.1243L28.994 10.2688C28.9689 10.1791 28.9569 10.0888 28.9569 10H20.9345C20.9346 10.1495 20.901 10.3013 20.8298 10.4444L16.6527 18.8414L31.1921 18.1243ZM27.7941 14.8021C27.7941 15.3544 27.3451 15.8021 26.7913 15.8021C26.2374 15.8021 25.7884 15.3544 25.7884 14.8021C25.7884 14.2498 26.2374 13.8021 26.7913 13.8021C27.3451 13.8021 27.7941 14.2498 27.7941 14.8021Z"
      fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M14.3575 18.9546L18.8119 10H8.01143C5.79598 10 4 11.7909 4 14V17.0065C4.03034 17.01 4.06079 17.0149 4.09127 17.0212L13.5402 18.9949L14.3575 18.9546ZM12.7513 15.8021C13.3051 15.8021 13.7541 15.3544 13.7541 14.8021C13.7541 14.2498 13.3051 13.8021 12.7513 13.8021C12.1974 13.8021 11.7484 14.2498 11.7484 14.8021C11.7484 15.3544 12.1974 15.8021 12.7513 15.8021Z"
      fill="currentColor"/>
</svg>
         <span>Tissue Samples</span>
      </span>
            <span
                className={cn(
                    "  min-w-24 flex justify-center bg-white dark:bg-neutral-900 items-center px-2 py-1 space-x-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path
    d="M25.0001 14.3333C25.0001 14.7874 24.6299 15.441 23.4859 16.0402C22.3892 16.6147 20.8049 17 19.0001 17C17.1954 17 15.611 16.6147 14.5144 16.0402C13.3703 15.441 13.0001 14.7874 13.0001 14.3333C13.0001 13.9367 13.274 13.3911 14.1358 12.8445L13.0645 11.1555C11.9273 11.8769 11.0001 12.9571 11.0001 14.3333C11.0001 15.9043 12.1969 17.0841 13.5864 17.8119C15.0232 18.5645 16.9389 19 19.0001 19C21.0613 19 22.977 18.5645 24.4139 17.8119C25.8033 17.0841 27.0001 15.9043 27.0001 14.3333C27.0001 12.9571 26.073 11.8769 24.9357 11.1555L23.8645 12.8445C24.7263 13.3911 25.0001 13.9367 25.0001 14.3333Z"
    fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M6.00012 15.5C6.00012 18.4759 7.87252 21.1321 10.8034 22.874C6.32904 25.5355 4.29161 30.3908 6.25181 33.786C8.23323 37.2179 13.549 37.8584 18.1249 35.2165C22.5586 32.6566 24.6709 27.9545 22.9955 24.5429C28.2204 23.311 32.0001 19.7281 32.0001 15.5C32.0001 10.2533 26.1798 6 19.0001 6C11.8204 6 6.00012 10.2533 6.00012 15.5ZM27.0125 20.6027C28.9891 19.1582 30.0001 17.3301 30.0001 15.5C30.0001 13.6699 28.9891 11.8418 27.0125 10.3973C25.0373 8.95388 22.211 8 19.0001 8C15.7892 8 12.9629 8.95388 10.9878 10.3973C9.0111 11.8418 8.00012 13.6699 8.00012 15.5C8.00012 17.3301 9.0111 19.1582 10.9878 20.6027C12.9629 22.0461 15.7892 23 19.0001 23C22.211 23 25.0373 22.0461 27.0125 20.6027ZM16.5658 24.8337C17.2795 24.9325 18.0138 24.9887 18.7636 24.9984C18.9612 25.1841 19.1359 25.4005 19.2802 25.6504C19.9239 26.7654 19.6897 28.0595 19.1126 29.1193C18.5258 30.1968 17.5099 31.2027 16.2331 31.9399C14.9563 32.677 13.5773 33.0539 12.3507 33.0233C11.1443 32.9932 9.90645 32.5489 9.26273 31.434C8.70025 30.4597 8.80992 29.3401 9.22847 28.3775L11.0626 29.175C10.8035 29.7708 10.8506 30.1842 10.9948 30.434C11.1583 30.7172 11.5787 31.0034 12.4006 31.0239C13.2024 31.0439 14.2219 30.7916 15.2331 30.2078C16.2443 29.624 16.9725 28.8672 17.3561 28.1628C17.7493 27.4408 17.7116 26.9336 17.5481 26.6504C17.4039 26.4006 17.0695 26.1532 16.4239 26.0796L16.5658 24.8337Z"
      fill="currentColor"/>
<path
    d="M35.8355 24.7644C38.2305 25.4061 40.5622 24.4702 41.0435 22.6739C41.5248 20.8777 39.9734 18.9013 37.5784 18.2596C35.1835 17.6179 32.8518 18.5538 32.3705 20.35C31.8892 22.1463 33.4405 24.1226 35.8355 24.7644Z"
    fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M42.2452 36.457C41.1739 40.4552 35.9838 42.5385 30.6528 41.11C25.3218 39.6816 21.8687 35.2824 22.94 31.2842C24.0113 27.286 29.2014 25.2027 34.5324 26.6311C39.8634 28.0596 43.3165 32.4588 42.2452 36.457ZM35.3073 35.3754C36.1393 35.1301 36.5027 34.7196 36.5966 34.369C36.6794 34.06 36.6077 33.616 36.1797 33.0778L37.7449 31.8328C38.4219 32.6839 38.8278 33.7696 38.5285 34.8866C38.186 36.1649 37.0739 36.9396 35.873 37.2938C34.6528 37.6535 33.168 37.6467 31.6872 37.2499C30.2063 36.8531 28.917 36.1166 28.0402 35.195C27.1773 34.2879 26.6015 33.0609 26.944 31.7826C27.2433 30.6656 28.1377 29.9283 29.1495 29.5297L29.8826 31.3905C29.2428 31.6425 28.9587 31.9912 28.8759 32.3002C28.7819 32.6508 28.8914 33.1881 29.4893 33.8165C30.0732 34.4303 31.0202 35.0007 32.2048 35.3181C33.3894 35.6355 34.4947 35.615 35.3073 35.3754Z"
      fill="currentColor"/>
</svg>

         <span>Cell Lines</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
                <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M38 34.2618V10.3761C38 8.16691 36.2091 6.37605 34 6.37605H28L26.868 5.21169C25.2973 3.5961 22.7027 3.5961 21.132 5.21169L20 6.37605H14C11.7909 6.37605 10 8.16691 10 10.376V34.2618C10 36.4709 11.7909 38.2618 14 38.2618H18V40.2617H23V44.2617H25V40.2617H30V38.2618H34C36.2091 38.2618 38 36.4709 38 34.2618ZM26.566 7.77021C26.9426 8.15753 27.4598 8.37605 28 8.37605H34C35.1046 8.37605 36 9.27148 36 10.3761V27.8006C35.7222 27.5852 35.4135 27.3722 35.0748 27.1751C33.2501 26.1132 30.6105 25.5605 27.4918 27.4005C24.924 28.9155 22.5089 29.3254 19.8818 29.3813C18.711 29.4062 17.5141 29.3609 16.2308 29.3123C16.0558 29.3057 15.8789 29.299 15.7005 29.2924C14.5325 29.2493 13.3017 29.2116 12 29.2328V10.376C12 9.27148 12.8954 8.37605 14 8.37605H20C20.5402 8.37605 21.0574 8.15753 21.434 7.77021L22.566 6.60584C23.3514 5.79805 24.6486 5.79805 25.434 6.60584L26.566 7.77021Z"
      fill="currentColor"/>
</svg>
         <span>Blood Samples</span>
      </span>
            <span
                className={cn(
                    " space-x-1 min-w-24 flex justify-center items-center bg-white dark:bg-neutral-900 px-2 py-1 text-sm rounded-md  shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                )}
            >
            <svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd"
      d="M9.17647 8.5C7.42215 8.5 6 9.93908 6 11.7143V31C6 32.7752 7.42215 34.2143 9.17647 34.2143H19.7646V36.3572H15.5293V38.5H32.4705V36.3572H28.2353V34.2143H38.8235C40.5778 34.2143 42 32.7752 42 31V11.7143C42 9.93908 40.5778 8.5 38.8235 8.5H9.17647ZM21.8823 36.3572V34.2143H26.1177V36.3572H21.8823ZM13.4119 12.7858H15.5296V14.9286H17.6475V17.0715H15.5296V19.2143H13.4119V17.0715H11.2945L11.2945 14.9286H13.4119V12.7858ZM11.2939 23.5001C11.2939 22.9083 11.768 22.4286 12.3528 22.4286H16.5881C17.1728 22.4286 17.6469 22.9083 17.6469 23.5001V27.7858C17.6469 28.3775 17.1728 28.8572 16.5881 28.8572H12.3528C11.768 28.8572 11.2939 28.3775 11.2939 27.7858V23.5001ZM20.8234 13.8572C20.8234 13.2655 21.2974 12.7858 21.8822 12.7858H26.1175C26.7023 12.7858 27.1763 13.2655 27.1763 13.8572V18.1429C27.1763 18.7346 26.7023 19.2143 26.1175 19.2143H21.8822C21.2974 19.2143 20.8234 18.7346 20.8234 18.1429V13.8572ZM20.8232 23.5001C20.8232 22.9083 21.2973 22.4286 21.8821 22.4286H26.1174C26.7021 22.4286 27.1762 22.9083 27.1762 23.5001V27.7858C27.1762 28.3775 26.7021 28.8572 26.1174 28.8572H21.8821C21.2973 28.8572 20.8232 28.3775 20.8232 27.7858V23.5001ZM30.3527 13.8572C30.3527 13.2655 30.8268 12.7858 31.4116 12.7858H35.6469C36.2316 12.7858 36.7057 13.2655 36.7057 13.8572V18.1429C36.7057 18.7346 36.2316 19.2143 35.6469 19.2143H31.4116C30.8268 19.2143 30.3527 18.7346 30.3527 18.1429V13.8572Z"
      fill="currentColor"/>
</svg>
         <span>Diagnostic Data</span>
      </span>
        </div>
    );
};
