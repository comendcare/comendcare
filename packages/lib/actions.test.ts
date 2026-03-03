jest.mock("@sendgrid/mail", () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))

jest.mock("nanoid", () => ({
  customAlphabet: jest.fn(),
}))

jest.mock("papaparse", () => ({
  __esModule: true,
  default: {
    parse: jest.fn(),
  },
}))

jest.mock("@dicebear/collection", () => ({
  __esModule: true,
  default: {
    identicon: jest.fn(),
    personas: jest.fn(),
  },
}))

jest.mock("@dicebear/core", () => ({
  __esModule: true,
  default: {
    createAvatar: jest.fn(),
  },
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("./emails", () => ({
  sendInviteEmail: jest.fn(),
  sendMemberDeletedEmail: jest.fn(),
  sendMemberRequestApprovedEmail: jest.fn(),
  sendMemberRequestCreatedEmail: jest.fn(),
  sendMemberRequestDeniedEmail: jest.fn(),
  sentNewOrganizationEmail: jest.fn(),
  sendProviderContactRequestEmail: jest.fn(),
}));

jest.mock("./raw-events", () => ({
  writeRawEvent: jest.fn(),
}));

jest.mock("comend-researcher-hub/lib/auth", () => ({
  withResearcherAuth: jest.fn(),
}))

jest.mock("./prisma", () => ({
  default: {
      biosample: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("./auth", () => ({
  authOptions: jest.fn(),
  getSession: jest.fn(),
  withAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withOrganizationAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withUserAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
}));

import prisma from "./prisma"
import { setBiosamplesVisibility } from "./actions"
import { revalidatePath } from "next/cache"

describe("setBiosamplesVisibilityCore", () => {
  const mockOrganization = { id: "org-123" } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates biosamples and revalidates path", async () => {
    (prisma.biosample.updateMany as jest.Mock).mockResolvedValue({
      count: 2,
    })

    const result = await setBiosamplesVisibility(
      mockOrganization,
      ["bio1", "bio2"],
      true
    )

    expect(prisma.biosample.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["bio1", "bio2"] },
      },
      data: {
        private: true,
      },
    })

    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/biosample")

    expect(result).toEqual({ count: 2 })
  })

  it("throws if organization id is missing", async () => {
    await expect(
      setBiosamplesVisibility(
        { id: undefined } as any,
        ["bio1"],
        true
      )
    ).rejects.toThrow("No organization id provided.")
  })

  it("rethrows prisma errors", async () => {
    ;(prisma.biosample.updateMany as jest.Mock).mockRejectedValue(
      new Error("DB failed")
    )

    await expect(
      setBiosamplesVisibility(mockOrganization, ["bio1"], true)
    ).rejects.toThrow("DB failed")
  })
})