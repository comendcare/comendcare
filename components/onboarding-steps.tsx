'use client';

import {usePathname} from 'next/navigation';
import {FaCheck} from 'react-icons/fa';
import {useOnboardingStore} from '@/state/onboarding/onboardingStore';
import {useSession} from 'next-auth/react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

type StepStatus = 'complete' | 'current' | 'upcoming' | 'disabled';

export interface Step {
    name: string;
    description: string;
    href: string;
    status?: StepStatus;
}

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

const allSteps: Step[] = [
    {
        name: 'Welcome to Comend',
        description: "We're glad to have you",
        href: '/onboarding/welcome',
    },
    {
        name: 'About you',
        description: 'Your profile information.',
        href: '/onboarding/user',
    },
    {
        name: 'Organization',
        description: 'Basic information about your organization.',
        href: '/onboarding/organization',
    },
    {
        name: 'Research',
        description: 'The current research efforts in your disorder.',
        href: '/onboarding/research',
    },
    {
        name: 'Finances',
        description: 'Your budget and raising efforts.',
        href: '/onboarding/finances',
    },
];

export default function OnboardingSteps() {
    const pathname = usePathname();
    const session = useSession();
    const isNewOrganization = useOnboardingStore((state) => state.isNewOrganization);

    // Check if user has an organization
    const hasOrganization = Boolean(session.data?.user.organizationId);

    // Determine which steps to show based on `isNewOrganization` and `hasOrganization`
    const steps = isNewOrganization
        ? allSteps.map((step) =>
            // If user is creating a new organization but no organizationId exists, disable "Finances" and "Research"
            !hasOrganization && ['Finances', 'Research'].includes(step.name)
                ? {...step, status: 'disabled'}
                : step
        )
        : allSteps.filter((step) => !['Finances', 'Research'].includes(step.name)); // Filter out if not a new organization

    // Determine the status of each step dynamically
    const updatedSteps = steps.map((step, index) => {
        if (step.status === 'disabled') return step;

        const isCurrent = pathname === step.href;
        const isComplete = index < steps.findIndex((s) => s.href === pathname);

        return {
            ...step,
            status: isCurrent ? 'current' : isComplete ? 'complete' : 'upcoming',
        };
    });

    return (
        <TooltipProvider>
            <nav aria-label="Progress">
                <ol role="list" className="overflow-hidden">
                    {updatedSteps.map((step, stepIdx) => (
                        <li
                            key={step.name}
                            className={classNames(
                                stepIdx !== updatedSteps.length - 1 ? 'pb-10' : '',
                                'relative'
                            )}
                        >
                            {step.status === 'complete' ? (
                                <>
                                    {stepIdx !== updatedSteps.length - 1 && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-indigo-600"
                                        />
                                    )}
                                    <a href={step.href} className="group relative flex items-start">
                                        <span className="flex h-9 items-center">
                                            <span
                                                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                                                <FaCheck aria-hidden="true" className="h-5 w-5 text-white"/>
                                            </span>
                                        </span>
                                        <span className="ml-4 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium">{step.name}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </a>
                                </>
                            ) : step.status === 'current' ? (
                                <>
                                    {stepIdx !== updatedSteps.length - 1 && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                                        />
                                    )}
                                    <a href={step.href} aria-current="step" className="group relative flex items-start">
                                        <span aria-hidden="true" className="flex h-9 items-center">
                                            <span
                                                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
                                                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"/>
                                            </span>
                                        </span>
                                        <span className="ml-4 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium text-indigo-600">{step.name}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </a>
                                </>
                            ) : step.status === 'upcoming' ? (
                                <>
                                    {stepIdx !== updatedSteps.length - 1 && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                                        />
                                    )}
                                    <a href={step.href} className="group relative flex items-start">
                                        <span aria-hidden="true" className="flex h-9 items-center">
                                            <span
                                                className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300"/>
                                            </span>
                                        </span>
                                        <span className="ml-4 flex min-w-0 flex-col">
                                            <span className="text-sm font-medium text-gray-500">{step.name}</span>
                                            <span className="text-sm text-gray-500">{step.description}</span>
                                        </span>
                                    </a>
                                </>
                            ) : (
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger className="text-left">
                                        <>
                                            {stepIdx !== updatedSteps.length - 1 && (
                                                <div
                                                    aria-hidden="true"
                                                    className="absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                                                />
                                            )}
                                            <div className="group relative flex items-start cursor-not-allowed">
                                                <span aria-hidden="true" className="flex h-9 items-center">
                                                    <span
                                                        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-gray-300"/>
                                                    </span>
                                                </span>
                                                <span className="ml-4 flex min-w-0 flex-col">
                                                    <span
                                                        className="text-sm font-medium text-gray-500">{step.name}</span>
                                                    <span className="text-sm text-gray-500">{step.description}</span>
                                                </span>
                                            </div>
                                        </>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You must create or join an organization before accessing this page.</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </TooltipProvider>
    );
}
