import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    Text,
    Tailwind,
    Img
} from "@react-email/components"
// import { EmailFooter } from "@/components/email-footer"

interface ContactEmailProps {
    name: string | null | undefined
    email: string | null | undefined
    message: string | null | undefined
}

export default function ContactEmail ({ name, email, message }: ContactEmailProps) {
    const firstName = name?.split(" ")[0]
    const previewText = `New contact form submission from: ${firstName}`

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px]">
                        <Img
                            className="w-full"
                            src="https://www.joincomend.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FFull%20logo.8169b0be.png&w=3840&q=75"
                            alt="Comend logo"
                        />
                        <Text className="text-sm">New contact form message from {name}:</Text>
                        <Text className="text-sm">{`"${message}"`}</Text>
                        <Text className="text-sm">Reply to {email}</Text>
                    </Container>
                    {/* <EmailFooter /> */}
                </Body>
            </Tailwind>
        </Html>
    )
}