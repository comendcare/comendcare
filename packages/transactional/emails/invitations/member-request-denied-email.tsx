import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface MemberRequestDeniedEmailProps {
    userName?: string | null
    userEmail?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const MemberRequestDeniedEmail = ({
                                             userName,
                                             userEmail,
                                             organizationName,
                                             organizationImage,
                                         }: MemberRequestDeniedEmailProps) => {
    const previewText = `Your request to join ${organizationName} has been denied`;

    return (
        <Html>
            <Head/>
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container
                        className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src="https://storage.googleapis.com/comend-app-public-permanent/Full%20logo.png"
                                width="40"
                                height="37"
                                alt="Comend"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Your request to join <strong>{organizationName}</strong> has been denied.
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {userName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Your request to join <strong>{organizationName}</strong> on Comend has been denied by the
                            organization admins.
                        </Text>
                        {organizationImage &&
                            <Img
                                className="rounded-full"
                                src={organizationImage}
                                width="64"
                                height="64"
                            />
                        }
                        <Text className="text-black text-[14px] leading-[24px]">
                            {`If you believe this is an error, please contact your organization's admin.`}
                        </Text>

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${baseUrl}/signin`}
                            >
                                Sign into Comend
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

MemberRequestDeniedEmail.PreviewProps = {
    userName: "Not Flawnson",
    userEmail: "flawnsontong1@gmail.com",
    organizationName: "Test org",
    organizationImage: `${baseUrl}/static/vercel-team.png`,
} as MemberRequestDeniedEmailProps;

export default MemberRequestDeniedEmail;
