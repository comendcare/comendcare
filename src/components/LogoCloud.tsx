import logoCharacter from "@/images/logos/affiliations/Character.png";
import logoManeki from "@/images/logos/affiliations/Maneki.png";
import logoDrive from "@/images/logos/affiliations/Drive.jpg";
import logoFoundersBoost from "@/images/logos/affiliations/FoundersBoost.png";
import logoNextAI from "@/images/logos/affiliations/NextAI.png";
import logoOpenTreatments from "@/images/logos/affiliations/Open Treatments.png";
import logo11ElevenLabsGrants from "@/images/logos/affiliations/11ElevenLabsGrants.png";
import logoOUAG from "@/images/logos/affiliations/OUAG.png";
import logoWABS from "@/images/logos/affiliations/WABS.png";
import Image from "next/image";


export const LogoCloud = () => {
    return (
        <div className="pb-16 pt-20 text-center lg:pt-32 mt-36 lg:mt-44">
            <p className="font-display text-base text-slate-900">
                Co-designed with these organizations so far
            </p>
            <ul
                role="list"
                className="mt-8 flex items-center justify-center gap-x-8 flex-col gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0"
            >
                {[
                    [
                        {name: 'Character', logo: logoCharacter},
                        {name: 'FoundersBoost', logo: logoFoundersBoost},
                        {name: 'NextAI', logo: logoNextAI},
                        {name: 'Drive Capital', logo: logoDrive},
                    ],
                    [
                        // {name: 'Once Upon A Gene', logo: logoOUAG},
                        // {name: 'WABS', logo: logoWABS},
                        {name: 'Maneki', logo: logoManeki},
                        {name: 'OpenTreatments', logo: logoOpenTreatments},
                        {name: '11ElevenLabs', logo: logo11ElevenLabsGrants},
                    ],
                ].map((group, groupIndex) => (
                    <li key={groupIndex}>
                        <ul
                            role="list"
                            className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0"
                        >
                            {group.map((company) => (
                                <li key={company.name} className="flex w-40">
                                    <Image src={company.logo} alt={company.name} unoptimized/>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    )
}