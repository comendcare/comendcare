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

interface MemberRequestApprovedEmailProps {
    userName?: string | null
    userEmail?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const MemberRequestApprovedEmail = ({
                                               userName,
                                               userEmail,
                                               organizationName,
                                               organizationImage,
                                           }: MemberRequestApprovedEmailProps) => {
    const previewText = `Your request to join ${organizationName} has been approved`;

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
                                alt="Comend"
                                className="w-1/2 my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Your request to join <strong>{organizationName}</strong> has been approved.
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {userName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Your request to join <strong>{organizationName}</strong> on Comend has been approved by the
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
                            {`You can sign in again to start using Comend.`}
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

MemberRequestApprovedEmail.PreviewProps = {
    userName: "Not Flawnson",
    userImage: `${baseUrl}/static/vercel-user.png`,
    userEmail: "flawnsontong1@gmail.com",
    adminName: "Flawnson",
    adminEmail: "flawnson@comendcare.com",
    organizationName: "Test org",
    organizationImage: `${baseUrl}/static/vercel-team.png`,
} as MemberRequestApprovedEmailProps;

export default MemberRequestApprovedEmail;
