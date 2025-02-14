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
    adminName?: string | null
    adminEmail?: string | null
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
                                          adminName,
                                          adminEmail,
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
                                width="40"
                                height="37"
                                alt="Comend"
                                className="my-0 mx-auto"
                            />
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            <strong>{requestedByUserName}</strong> is requesting to join <strong>{organizationName}</strong>
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Hello {adminName},
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            <strong>{requestedByUserName}</strong> (
                            <Link
                                href={`mailto:${requestedByUserEmail}`}
                                className="text-blue-600 no-underline"
                            >
                                {requestedByUserEmail}
                            </Link>
                            ) is requesting to join<strong>{organizationName}</strong> on{" "}
                            <strong>Comend</strong>.
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
                                href={`${baseUrl}/app/settings`}
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

NewMemberRequestEmail.PreviewProps = {
    requestedByUserName: "Not Flawnson",
    userImage: `${baseUrl}/static/vercel-user.png`,
    requestedByUserEmail: "flawnsontong1@gmail.com",
    adminName: "Flawnson",
    adminEmail: "flawnson@comendcare.com",
    organizationName: "Test org",
    organizationImage: `${baseUrl}/static/vercel-team.png`,
} as NewMemberRequestEmailProps;

export default NewMemberRequestEmail;
