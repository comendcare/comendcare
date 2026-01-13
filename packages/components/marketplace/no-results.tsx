import { Card, CardContent } from "@comend/components/ui/card"
import { NoResultsTemplate } from "@comend/components/no-results"

export const NoResultsView = () => {
    return (
        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
            <CardContent className="flex gap-4 p-4">
                <NoResultsTemplate 
                    imgAlt="No results"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    title="Sorry, we don't have any results for that search"
                    description="Please try another search."
                />
            </CardContent>
        </Card>
    )
}