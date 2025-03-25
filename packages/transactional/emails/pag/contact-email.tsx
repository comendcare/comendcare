import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Text,
    Tailwind,
    Img
} from "@react-email/components";

interface ContactEmailProps {
    name?: string | null;
    message?: string | null;
    sendingEmail?: string | null;
    receivingEmail?: string | null;
}

export default function PAGContactEmail({ name, message, sendingEmail, receivingEmail }: ContactEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>New contact request from {name || "a user"}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px] border border-gray-200 rounded-lg shadow-sm">
                        <Img
                            className="w-1/2 mb-4 mx-auto"
                            src="https://storage.googleapis.com/comend-app-public-permanent/Full%20logo.png"
                            alt="Comend logo"
                        />
                        <Text className="text-lg font-semibold">
                            New Contact Request
                        </Text>
                        <Text className="text-sm">
                            <strong>From:</strong> {name || "Unknown User"}
                        </Text>
                        <Text className="text-sm">
                            <strong>Email:</strong> {sendingEmail || "No email provided"}
                        </Text>
                        <Text className="mt-4 text-sm border-t pt-3">
                            <strong>Message:</strong>
                        </Text>
                        <Text className="text-sm whitespace-pre-wrap">
                            {message || "No message provided"}
                        </Text>
                        <Text className="mt-6 text-xs text-gray-500">
                            This message was sent to {receivingEmail || "your email"}.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
