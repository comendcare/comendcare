import {
    Body,
    Container,
    Head,
    Html,
    Link,
    Text,
    Tailwind,
    Img
} from "@react-email/components"

interface WaitlistEmailProps {
    user: {
        name: string | null | undefined
        email: string | null | undefined
    },
    organization: {
        name: string | null | undefined
        subdomain: string | null | undefined
    }
}

export default function NewOrganizationEmail ({ user, organization }: WaitlistEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="my-10 mx-auto p-5 w-[465px]">
                        <Img
                            className="w-full"
                            src="https://storage.cloud.google.com/comend-app-public-permanent/Full%20logo.png"
                            alt="Comend logo"
                        />
                        <Text className="text-sm">
                            A new organization {organization.name} with the subdomain {organization.subdomain} has been created.
                        </Text>
                        <Text className="text-sm">
                            Verify their organization on the admin panel
                            <Link
                                href={`https:${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                                className="text-blue-600 no-underline"
                            >
                                admin panel
                            </Link>
                        </Text>
                        <Text className="text-sm">
                            Reach out to {user.name} at {user.email} if there are any issues.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
