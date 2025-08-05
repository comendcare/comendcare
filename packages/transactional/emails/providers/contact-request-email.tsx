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

interface ContactRequestEmailProps {
    userName?: string | null
    userEmail?: string | null
    providerName?: string | null
    organizationName?: string | null
    organizationImage?: string | null
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const ContactRequestEmail = ({
                                        userName,
                                        userEmail,
                                        providerName,
                                        organizationName,
                                        organizationImage,
                                    }: ContactRequestEmailProps) => {
    const previewText = `You've been removed from ${organizationName} on Comend`;

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
                                alt="Comend logo"
                                className="w-1/2 my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            {`Someone has requested to contact `}<strong>{providerName}</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {userName} from <strong>{organizationName}</strong> has requested to contact {providerName}.
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`https://admin.comend.io/admin/companies/contact-requests`}
                            >
                                Go back to Comend.
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

ContactRequestEmail.PreviewProps = {
    userName: "Flawnson",
    userEmail: "flawnsontong1@gmail.com",
    providerName: "Some company",
    organizationName: "Some organization",
    organizationImage: `${baseUrl}/static/vercel-team.png`,
} as ContactRequestEmailProps;

export default ContactRequestEmail;
