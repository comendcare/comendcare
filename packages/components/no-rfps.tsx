import { NoResultsTemplate } from "./no-results";

export function NoRFPs({isPrivate}: {isPrivate: boolean}) {
    return (
        <NoResultsTemplate 
            imgAlt="No RFPs"
            src="https://illustrations.popsy.co/gray/shaking-hands.svg"
            title={`${isPrivate ? 'Your' : 'This'} organization does not have any public RFPs.`}
        />
    )
}
