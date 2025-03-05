import React from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button";
import {FaUsers} from "react-icons/fa6";

export const ProfileCompletionCard = ({milestones, completedCount}: { milestones: any, completedCount: number }) => {
    const completionPercentage = (completedCount / milestones.length) * 100;
    let profileStrength;

    if (completionPercentage === 100) {
        profileStrength = "Complete";
    } else if (completionPercentage >= 70) {
        profileStrength = "Advanced";
    } else if (completionPercentage >= 40) {
        profileStrength = "Intermediate";
    } else {
        profileStrength = "Beginner";
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="scroll-m-20 text-xl font-normal tracking-tight">
                    Profile strength: <span className="font-bold">{profileStrength}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <ol className="flex items-center w-full">
                    {milestones.map((milestone: string, index: number) => {
                        const isCompleted = index < completedCount;
                        return (
                            <li
                                key={index}
                                className={`flex w-full items-center ${
                                    index < milestones.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ""
                                } ${
                                    isCompleted
                                        ? "text-blue-600 dark:text-blue-500 after:border-blue-light dark:after:border-blue-800"
                                        : "after:border-gray-100 dark:after:border-gray-700"
                                }`}
                            >
            <span
                className={`flex items-center justify-center w-6 h-6 rounded-full lg:h-8 lg:w-8 shrink-0 ${
                    isCompleted ? "bg-blue-light dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"
                }`}
            >
              {isCompleted ? (
                  <svg
                      className="w-1.5 h-1.5 text-blue-dark lg:w-3 lg:h-3 dark:text-blue-300"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                  >
                      <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M1 5.917 5.724 10.5 15 1.5"
                      />
                  </svg>
              ) : (
                  <svg
                      className="w-2 h-2 text-gray-500 lg:w-3 lg:h-3 dark:text-gray-100"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 16"
                  >
                      <path
                          d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z"/>
                  </svg>
              )}
            </span>
                            </li>
                        );
                    })}
                </ol>
                <div className="space-y-6">
                    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <div>
                            <FaUsers className="size-8"/>
                        </div>
                        <div className="space-y-1 leading-none">
                            <div>
                                Use different settings for my mobile devices
                            </div>
                            <div>
                                You can manage your mobile notifications in the{" "}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="place-self-end">
                <Button variant={"cta"}>
                    Complete profile
                </Button>
            </CardFooter>
        </Card>
    );
};
