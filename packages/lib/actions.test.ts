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
    emailCapture: {
      upsert: jest.fn(),
    },
    memberRequest: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
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
import { addEmailCapture, createMemberRequest, setBiosamplesVisibility } from "./actions"
import { revalidatePath } from "next/cache"
import { getSession } from "./auth"
import { sendMemberRequestCreatedEmail } from "./emails"

describe("addEmailCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("calls prisma.emailCapture.upsert with lowercased email", async () => {
    ;(prisma.emailCapture.upsert as jest.Mock).mockResolvedValue({})

    await addEmailCapture("TEST@Example.COM")

    expect(prisma.emailCapture.upsert).toHaveBeenCalledTimes(1)
    expect(prisma.emailCapture.upsert).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      update: {},
      create: { email: "test@example.com" },
    })
  })

  it("awaits the prisma upsert call", async () => {
    const mockPromise = Promise.resolve({})
    ;(prisma.emailCapture.upsert as jest.Mock).mockReturnValue(mockPromise)

    await addEmailCapture("user@email.com")

    expect(prisma.emailCapture.upsert).toHaveBeenCalled()
  })

  it("throws if prisma upsert throws", async () => {
    ;(prisma.emailCapture.upsert as jest.Mock).mockRejectedValue(
      new Error("DB error")
    )

    await expect(addEmailCapture("fail@email.com")).rejects.toThrow("DB error")
  })
})

describe("createMemberRequest", () => {
  const mockSession = {
    user: {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      image: "image.png",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it("throws if session is missing", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)

    await expect(createMemberRequest("org-1")).rejects.toThrow(
      "You must be signed in to perform this action"
    )
  })

  it("returns error if request already exists", async () => {
    ;(prisma.memberRequest.findUnique as jest.Mock).mockResolvedValue({
      id: "existing-request",
    })

    const result = await createMemberRequest("org-1")

    expect(result).toEqual({
      success: false,
      error: "You have already sent a request to join this organization.",
    })
  })

  it("creates a new member request and sends email", async () => {
    ;(prisma.memberRequest.findUnique as jest.Mock).mockResolvedValue(null)

    const createdRequest = {
      id: "new-request",
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "image.png",
      },
    }

    ;(prisma.memberRequest.create as jest.Mock).mockResolvedValue(
      createdRequest
    )

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue({
      id: "org-1",
      name: "Test Org",
      image: "org.png",
      members: [
        {
          user: { name: "Owner", email: "owner@example.com" },
        },
      ],
    })

    const result = await createMemberRequest("org-1")

    expect(prisma.memberRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@example.com",
          role: "member",
        }),
      })
    )

    expect(sendMemberRequestCreatedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          name: "Test User",
        }),
        owners: [
          {
            name: "Owner",
            email: "owner@example.com",
          },
        ],
        organizationName: "Test Org",
      })
    )

    expect(result).toEqual({
      success: true,
      data: createdRequest,
    })
  })

  it("returns database error if create fails", async () => {
    ;(prisma.memberRequest.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.memberRequest.create as jest.Mock).mockRejectedValue(
      new Error("DB failure")
    )

    const result = await createMemberRequest("org-1")

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })

  it("returns database error if memberRequest is falsy", async () => {
    ;(prisma.memberRequest.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.memberRequest.create as jest.Mock).mockResolvedValue(null)

    const result = await createMemberRequest("org-1")

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })
})

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
