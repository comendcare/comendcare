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

interface MemberDeletedEmailProps {
    userName?: string | null
    userEmail?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const MemberDeletedEmail = ({
                                          userName,
                                          userEmail,
                                          organizationName,
                                          organizationImage,
                                      }: MemberDeletedEmailProps) => {
    const previewText = `You've been removed from ${organizationName} on Comend`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <Img
                                src="https://storage.googleapis.com/comend-app-public-permanent/Full%20logo.png"
                                alt="Comend logo"
                                className="w-1/2 my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            {`You've been removed from `}<strong>{organizationName}</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {userName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            {`You've been removed from `} <strong>{organizationName}</strong> on{" "}
                            <strong>Comend</strong>. If you believe this was a mistake, please contact the owners of your organization.
                        </Text>
                        <Section>
                            <Row>
                                <Column align="right">
                                    {organizationImage &&
                                        <Img
                                            className="rounded-full"
                                            src={organizationImage}
                                            width="64"
                                            height="64"
                                        />
                                    }
                                </Column>
                                <Column align="center">
                                    <Img
                                        src={`${baseUrl}/static/vercel-arrow.png`}
                                        width="12"
                                        height="9"
                                        alt="asking to join"
                                    />
                                </Column>
                                <Column align="left">
                                    <Img
                                        className="rounded-full"
                                        src={organizationImage}
                                        width="64"
                                        height="64"
                                    />
                                </Column>
                            </Row>
                        </Section>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${baseUrl}/app/profile`}
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

MemberDeletedEmail.PreviewProps = {
    requestedByUserName: "Not Flawnson",
    userImage: `${baseUrl}/static/vercel-user.png`,
    requestedByUserEmail: "flawnsontong1@gmail.com",
    adminName: "Flawnson",
    adminEmail: "flawnson@comendcare.com",
    organizationName: "Test org",
    organizationImage: `${baseUrl}/static/vercel-team.png`,
} as MemberDeletedEmailProps;

export default MemberDeletedEmail;
