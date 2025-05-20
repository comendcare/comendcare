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
    userImage?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const MemberRequestApprovedEmail = ({
                                               userName,
                                               userImage,
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
                        <Section>
                            <Row>
                                <Column align="right">
                                    {userImage ? (
                                        <Img
                                            className="rounded-full"
                                            src={userImage}
                                            width="64"
                                            height="64"
                                        />
                                    ) : (
                                        // flexbox and grid styling doesn't work reliably in emails
                                        // instead use a table
                                        <table
                                            style={{
                                                height: "64px",
                                                width: "64px",
                                                borderRadius: "9999px",
                                                backgroundColor: "#e5e7eb",
                                            }}
                                        >
                                            <tr>
                                                <td
                                                align="center"
                                                valign="middle"
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "bold",
                                                    color: "#374151",
                                                    borderRadius: "9999px",
                                                }}
                                                >
                                                {userName?.[0] ?? "?"}
                                                </td>
                                            </tr>
                                        </table>
                                    )}
                                </Column>
                                <Column align="center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round" className="lucide lucide-arrow-big-right-dash">
                                        <path d="M5 9v6"/>
                                        <path d="M9 9h3V5l7 7-7 7v-4H9V9z"/>
                                    </svg>
                                </Column>
                                <Column align="left">
                                    {organizationImage ? (
                                        <Img
                                            className="rounded-full"
                                            src={organizationImage}
                                            width="64"
                                            height="64"
                                        />
                                    ) : (
                                        // flexbox and grid styling doesn't work reliably in emails
                                        // instead use a table
                                        <table
                                            style={{
                                                height: "64px",
                                                width: "64px",
                                                borderRadius: "9999px",
                                                backgroundColor: "#e5e7eb",
                                            }}
                                        >
                                            <tr>
                                                <td
                                                align="center"
                                                valign="middle"
                                                style={{
                                                    fontSize: "24px",
                                                    fontWeight: "bold",
                                                    color: "#374151",
                                                    borderRadius: "9999px",
                                                }}
                                                >
                                                {organizationName?.[0] ?? "?"}
                                                </td>
                                            </tr>
                                        </table>
                                    )}
                                </Column>
                            </Row>
                        </Section>
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
    userName: "Flawnson",
    userImage: ``,
    userEmail: "flawnsontong1@gmail.com",
    adminName: "Flawnson",
    adminEmail: "flawnson@comendcare.com",
    organizationName: "Test org",
    organizationImage: ``,
} as MemberRequestApprovedEmailProps;

export default MemberRequestApprovedEmail;
