"use client"

import {useState} from "react"
import {AlertCircle} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@comend/components/ui/card"
import {Label} from "@comend/components/ui/label"
import {Checkbox} from "@comend/components/ui/checkbox"

export default function RequestPageTermsAndConditionsCard() {
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <AlertCircle className="w-5 h-5"/>
                    Terms and Conditions
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Data Use Agreement</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        By submitting this request, you agree to comply with all applicable laws, regulations, and
                        institutional policies regarding the use of human biological materials and associated data. You
                        acknowledge that:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Materials and data will be used solely for the stated research purposes</li>
                        <li>No attempt will be made to identify individual participants</li>
                        <li>Data will be stored securely and access will be limited to authorized personnel</li>
                        <li>Results may be published in peer-reviewed journals with appropriate acknowledgment</li>
                        <li>Materials and data will be destroyed or returned as specified in the agreement</li>
                    </ul>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="terms-agreement" checked={agreedToTerms} onCheckedChange={setAgreedToTerms as any} required/>
                    <Label htmlFor="terms-agreement" className="text-sm leading-relaxed">
                        I have read and agree to the terms and conditions outlined above. I understand that this request
                        will
                        be reviewed by the biobank access committee and that additional documentation may be required. *
                    </Label>
                </div>
            </CardContent>
        </Card>
    )
}
