"use client"
import React, {ReactNode} from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import mixpanel from "mixpanel-browser"
import {toast} from "sonner";

export default function ShareDialog({
                                        url,
                                    }: {
    url: string
}) {

    const handleCopyResourceLinkToClipboard = async () => {
        trackMixpanelEvent("Link")
        try {
            await navigator.clipboard.writeText(url)
            toast.success(`URL successfully copied to clipboard.`)
        } catch (error) {
            toast.error(`Couldn't copy URL, please copy manually.`)
        }
    }

    const trackMixpanelEvent = (socialOption: string) => {
        mixpanel.track(`Organization Profile Shared`, {
            "Platform": socialOption
        })
    }

    return (
        <>
            <DialogHeader className="gap-2">
                <DialogTitle>Share Page</DialogTitle>
                <DialogDescription className="flex flex-col space-y-4">
                    <div className="flex justify-center items-center">
                        <div className="grid grid-cols-2 gap-4 sm:flex sm:justify-around">
                            <a
                                className="border hover:bg-[#1877f2] w-12 h-12 fill-[#1877f2] hover:fill-white border-blue-200 rounded-full flex items-center justify-center shadow-md hover:shadow-blue-500/50 cursor-pointer"
                                href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Facebook")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#B2D1FB] w-12 h-12 fill-[#1877f2] hover:fill-white border-blue-200 rounded-full flex items-center justify-center shadow-md hover:shadow-blue-500/50 cursor-pointer"
                                href={`http://www.facebook.com/dialog/send?app_id=738683701326096&name=Facebook%20Dialogs&link=${url}&redirect_uri=https://www.librarey.com/`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Messenger")}
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 32 32"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16 28.1791C23.1797 28.1791 29 22.5426 29 15.5896C29 8.63654 23.1797 3 16 3C8.8203 3 3 8.63654 3 15.5896C3 19.3712 4.72168 22.7634 7.44737 25.0711V27.6188C7.44737 28.6145 8.4616 29.2824 9.36588 28.8821L12.193 27.6307C13.397 27.9873 14.6754 28.1791 16 28.1791Z"
                                        fill="url(#paint0_linear_87_7239)"
                                    />
                                    <path
                                        d="M12.887 12.9133L9.11723 18.0689C8.71304 18.6217 9.43994 19.2858 9.99334 18.8693L13.2123 16.4469C13.5399 16.2003 13.9992 16.197 14.3307 16.4388L17.1935 18.5272C17.7425 18.9277 18.5272 18.8125 18.9269 18.2727L22.8805 12.9341C23.2905 12.3804 22.558 11.7109 22.0038 12.1328L18.6006 14.7236C18.2729 14.9731 17.8112 14.9777 17.4782 14.7347L14.6247 12.6531C14.0733 12.2509 13.285 12.369 12.887 12.9133Z"
                                        fill="white"
                                    />
                                    <defs>
                                        <linearGradient
                                            id="paint0_linear_87_7239"
                                            x1="16"
                                            y1="3"
                                            x2="11.8286"
                                            y2="28.8583"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stopColor="#00B1FF"/>
                                            <stop offset="1" stopColor="#006BFF"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#1d9bf0] w-12 h-12 fill-[#1d9bf0] hover:fill-white border-blue-200 rounded-full flex items-center justify-center shadow-md hover:shadow-sky-500/50 cursor-pointer"
                                href={`https://twitter.com/intent/tweet?text=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Twitter")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"></path>
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#ff5700] w-12 h-12 fill-[#ff5700] hover:fill-white border-orange-200 rounded-full flex items-center justify-center shadow-md hover:shadow-pink-500/50 cursor-pointer"
                                href={`https://reddit.com/submit?url=${url}&title=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Reddit")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M20.0193 8.90951C20.0066 8.98984 20 9.07226 20 9.15626C20 10.0043 20.6716 10.6918 21.5 10.6918C22.3284 10.6918 23 10.0043 23 9.15626C23 8.30819 22.3284 7.6207 21.5 7.6207C21.1309 7.6207 20.7929 7.7572 20.5315 7.98359L16.6362 7L15.2283 12.7651C13.3554 12.8913 11.671 13.4719 10.4003 14.3485C10.0395 13.9863 9.54524 13.7629 9 13.7629C7.89543 13.7629 7 14.6796 7 15.8103C7 16.5973 7.43366 17.2805 8.06967 17.6232C8.02372 17.8674 8 18.1166 8 18.3696C8 21.4792 11.5817 24 16 24C20.4183 24 24 21.4792 24 18.3696C24 18.1166 23.9763 17.8674 23.9303 17.6232C24.5663 17.2805 25 16.5973 25 15.8103C25 14.6796 24.1046 13.7629 23 13.7629C22.4548 13.7629 21.9605 13.9863 21.5997 14.3485C20.2153 13.3935 18.3399 12.7897 16.2647 12.7423L17.3638 8.24143L20.0193 8.90951ZM12.5 18.8815C13.3284 18.8815 14 18.194 14 17.3459C14 16.4978 13.3284 15.8103 12.5 15.8103C11.6716 15.8103 11 16.4978 11 17.3459C11 18.194 11.6716 18.8815 12.5 18.8815ZM19.5 18.8815C20.3284 18.8815 21 18.194 21 17.3459C21 16.4978 20.3284 15.8103 19.5 15.8103C18.6716 15.8103 18 16.4978 18 17.3459C18 18.194 18.6716 18.8815 19.5 18.8815ZM12.7773 20.503C12.5476 20.3462 12.2372 20.4097 12.084 20.6449C11.9308 20.8802 11.9929 21.198 12.2226 21.3548C13.3107 22.0973 14.6554 22.4686 16 22.4686C17.3446 22.4686 18.6893 22.0973 19.7773 21.3548C20.0071 21.198 20.0692 20.8802 19.916 20.6449C19.7628 20.4097 19.4524 20.3462 19.2226 20.503C18.3025 21.1309 17.1513 21.4449 16 21.4449C15.3173 21.4449 14.6345 21.3345 14 21.1137C13.5646 20.9621 13.1518 20.7585 12.7773 20.503Z"
                                        fill="#ff5700 hover:fill-white"
                                    />
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#EA4335] w-12 h-12 fill-[#EA4335] hover:fill-white border-red-200 rounded-full flex items-center justify-center shadow-md hover:shadow-pink-500/50 cursor-pointer"
                                href={`mailto:email@example.com?subject=Librarey Resource&body=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Email")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6zm3.519 0L12 11.671 18.481 6H5.52zM20 7.329l-7.341 6.424a1 1 0 0 1-1.318 0L4 7.329V18h16V7.329z"
                                        fill="0D0D0D"
                                    />
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#25D366] w-12 h-12 fill-[#25D366] hover:fill-white border-green-200 rounded-full flex items-center justify-center shadow-md hover:shadow-green-500/50 cursor-pointer"
                                href={`whatsapp://send?text=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Whatsapp")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"
                                    ></path>
                                </svg>
                            </a>
                            <a
                                className="border hover:bg-[#229ED9] w-12 h-12 fill-[#229ED9] hover:fill-white border-sky-200 rounded-full flex items-center justify-center shadow-md hover:shadow-sky-500/50 cursor-pointer"
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                onClick={() => trackMixpanelEvent("Linkedin")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M20.47,2H3.53A1.45,1.45,0,0,0,2.06,3.43V20.57A1.45,1.45,0,0,0,3.53,22H20.47a1.45,1.45,0,0,0,1.47-1.43V3.43A1.45,1.45,0,0,0,20.47,2ZM8.09,18.74h-3v-9h3ZM6.59,8.48h0a1.56,1.56,0,1,1,0-3.12,1.57,1.57,0,1,1,0,3.12ZM18.91,18.74h-3V13.91c0-1.21-.43-2-1.52-2A1.65,1.65,0,0,0,12.85,13a2,2,0,0,0-.1.73v5h-3s0-8.18,0-9h3V11A3,3,0,0,1,15.46,9.5c2,0,3.45,1.29,3.45,4.06Z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col md:flex-row gap-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                defaultValue={url}
                                disabled
                                className="w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-md ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                placeholder={url}
                            />
                            <button
                                className={`rounded-md bg-blue-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700`}
                                onClick={handleCopyResourceLinkToClipboard}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </DialogDescription>
            </DialogHeader>
        </>
    )
}
