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

interface NewMemberRequestEmailProps {
    requestedByUserName?: string | null
    requestedByUserImage?: string | null
    requestedByUserEmail?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_ROOT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    : "";


export const NewMemberRequestEmail = ({
                                        requestedByUserName,
                                        requestedByUserImage,
                                        requestedByUserEmail,
                                        organizationName,
                                        organizationImage,
                                      }: NewMemberRequestEmailProps) => {
    const previewText = `${requestedByUserName} is requesting to join ${organizationName}`;

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
                            <strong>{requestedByUserName}</strong> is requesting to join <strong>{organizationName}</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello,
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{requestedByUserName}</strong> (
                            <Link
                                href={`mailto:${requestedByUserEmail}`}
                                className="text-blue-600 no-underline"
                            >
                                {requestedByUserEmail}
                            </Link>
                            ) is requesting to join <strong>{organizationName}</strong> on{" "}
                            <strong>Comend</strong>.
                        </Text>
                        <Section>
                            <Row>
                                <Column align="right">
                                    {requestedByUserImage ? (
                                        <Img
                                            className="rounded-full"
                                            src={encodeURI(requestedByUserImage)}
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
                                                {requestedByUserName?.[0] ?? "?"}
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
                                            src={encodeURI(organizationImage)}
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
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${baseUrl}/app/settings?tab=members`}
                            >
                                Accept member request
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

// NewMemberRequestEmail.PreviewProps = {
//     requestedByUserName: "Not Flawnson",
//     userImage: ``,
//     requestedByUserEmail: "flawnsontong1@gmail.com",
//     adminName: "Flawnson",
//     adminEmail: "flawnson@comendcare.com",
//     organizationName: "Test org",
//     organizationImage: ``,
// } as NewMemberRequestEmailProps;

// export default NewMemberRequestEmail;
