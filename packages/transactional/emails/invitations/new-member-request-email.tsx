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
    requestedByUserName?: string
    requestedByUserImage?: string | null
    requestedByUserEmail?: string | null
    adminName?: string | null
    adminEmail?: string | null
    organizationName?: string;
    organizationImage?: string;
}

const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";

// To avoid needing to host and reference the image off-platform
const base64Logo = "data:image/png;base64,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"

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
                                // src={`https://drive.google.com/uc?export=download&id=1WDHwTFP-xgWD935vTrizrfzkRVInwzUk/view?usp=drive_link`}
                                src={base64Logo}
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
                                href={`${baseUrl}/app/dashboard`}
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
