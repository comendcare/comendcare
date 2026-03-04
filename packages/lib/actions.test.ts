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

// Mock the DB calls
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
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    condition: {
      upsert: jest.fn(),
    },
    conditionToOrganization: {
      create: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    milestone: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("./auth", () => ({
  authOptions: jest.fn(),
  getSession: jest.fn(),
  withAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withOrganizationAuth: <T extends (...args: any[]) => any>(fn: T): T => fn, // bypass authentication (tested separately in auth.test.ts)
  withUserAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
}));

jest.mock("./customerio/cio-sync-org", () => ({
  cioSyncOrg: jest.fn(),
  cioUpsertOrgMember: jest.fn(),
  cioRemoveOrgMember: jest.fn()
}))

jest.mock("./revalidate", () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}))

jest.mock("./utils", () => ({
  addTypeSenseDocument: jest.fn(),
  deleteTypeSenseDocument: jest.fn(),
  getBlurDataURL: jest.fn(),
  logError: jest.fn(),
  toKebabCase: jest.fn(),
  updateTypeSenseDocument: jest.fn(),
  normalizeTag: jest.fn(),
  runInProduction: jest.fn(async (fn: any) => fn()),
}))

jest.mock("./raw-events", () => ({
  writeRawEvent: jest.fn(),
}))

import prisma from "./prisma"
import { 
  addEmailCapture, 
  connectOrganizationToCondition, 
  createCondition, 
  createMemberRequest, 
  createOrganization, 
  setBiosamplesVisibility,
  toggleBiopharmaConsentSettings,
  toggleOrganizationPublished,
  toggleOrganizationVerified, 
} from "./actions"
import { revalidatePath, revalidateTag } from "next/cache"
import { getSession } from "./auth"
import { sendMemberRequestCreatedEmail } from "./emails"
import { Prisma } from "@prisma/client"
import {
  addTypeSenseDocument,
  deleteTypeSenseDocument
} from "./utils"

// helper to create a FormData mock
const makeFormData = (fields: Record<string, any>) => {
  const formData = {
    get: (key: string) => fields[key] ?? null,
  } as unknown as FormData
  return formData
}

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

describe("createCondition", () => {
  const mockSession = {
    user: { id: "user-1", name: "Test User", email: "test@example.com" },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it("returns error if not authenticated", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    const formData = makeFormData({ name: "Condition A" })

    const result = await createCondition(formData)

    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("successfully upserts a condition with comma-separated arrays", async () => {
    const formData = makeFormData({
      name: "Condition A",
      summary: "A test condition",
      diseaseCategories: "Category1, Category2",
      causalGenes: "GENE1, GENE2",
      numberOfPatientsEngaged: "100",
    })

    const expectedCondition = { id: "cond-1", name: "Condition A" }
    ;(prisma.condition.upsert as jest.Mock).mockResolvedValue(expectedCondition)

    const result = await createCondition(formData)

    expect(prisma.condition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          name: "Condition A",
          summary: "A test condition",
          diseaseCategories: ["Category1", "Category2"],
          causalGenes: ["GENE1", "GENE2"],
          numberOfPatientsEngaged: 100,
        }),
        update: expect.objectContaining({
          name: "Condition A",
          summary: "A test condition",
        }),
      })
    )

    expect(result).toEqual({ success: true, data: expectedCondition })
  })

  it("parses JSON arrays correctly", async () => {
    const formData = makeFormData({
      name: "Condition B",
      summary: "JSON test",
      diseaseCategories: JSON.stringify(["Cat1", "Cat2"]),
      associatedConditions: JSON.stringify(["Cond1", "Cond2"]),
    })

    const expectedCondition = { id: "cond-2", name: "Condition B" }
    ;(prisma.condition.upsert as jest.Mock).mockResolvedValue(expectedCondition)

    const result = await createCondition(formData)

    expect(result).toEqual({ success: true, data: expectedCondition })
    expect(prisma.condition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          diseaseCategories: ["Cat1", "Cat2"],
          associatedConditions: ["Cond1", "Cond2"],
        }),
      })
    )
  })

  it("returns database error if upsert returns null", async () => {
    const formData = makeFormData({ name: "Condition C", summary: "Test" })
    ;(prisma.condition.upsert as jest.Mock).mockResolvedValue(null)

    const result = await createCondition(formData)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })

  it("returns duplicate error for Prisma P2002", async () => {
    const formData = makeFormData({ name: "Condition D", summary: "Test" })
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "4.16.1" }
    )

    ;(prisma.condition.upsert as jest.Mock).mockRejectedValue(error)

    const result = await createCondition(formData)

    expect(result).toEqual({
      success: false,
      error: "A condition with this name already exists.",
    })
  })

  it("returns generic database error for other errors", async () => {
    const formData = makeFormData({ name: "Condition E", summary: "Test" })
    ;(prisma.condition.upsert as jest.Mock).mockRejectedValue(
      new Error("DB down")
    )

    const result = await createCondition(formData)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })
})

describe("connectOrganizationToCondition", () => {
  const mockSession = {
    user: { id: "user-1", name: "Test User", email: "test@example.com" },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it("returns error if not authenticated", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)

    const result = await connectOrganizationToCondition("org-1", "cond-1")

    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("returns error if organizationId is null", async () => {
    const result = await connectOrganizationToCondition(null, "cond-1")

    expect(result).toEqual({ error: "No organization Id" })
  })

  it("successfully connects organization to condition", async () => {
    const createdRecord = { id: "link-1", conditionId: "cond-1", organizationId: "org-1" }
    ;(prisma.conditionToOrganization.create as jest.Mock).mockResolvedValue(createdRecord)

    const result = await connectOrganizationToCondition("org-1", "cond-1")

    expect(prisma.conditionToOrganization.create).toHaveBeenCalledWith({
      data: { conditionId: "cond-1", organizationId: "org-1" },
    })

    expect(result).toEqual({ success: true, data: createdRecord })
  })

  it("returns database error if create returns null", async () => {
    ;(prisma.conditionToOrganization.create as jest.Mock).mockResolvedValue(null)

    const result = await connectOrganizationToCondition("org-1", "cond-1")

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })

  it("returns error message if prisma.create throws", async () => {
    ;(prisma.conditionToOrganization.create as jest.Mock).mockRejectedValue(
      new Error("DB down")
    )

    const result = await connectOrganizationToCondition("org-1", "cond-1")

    expect(result).toEqual({
      success: false,
      error: "DB down",
    })
  })
})

describe("createOrganization", () => {
  const mockSession = {
    user: { id: "user-1", name: "Test User", email: "test@example.com" },
  }

  const mockFormData = (fields: Record<string, any>) => ({
    get: (key: string) => fields[key] ?? null,
  } as unknown as FormData)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it("returns error if not authenticated", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    const formData = mockFormData({ name: "Org A", subdomain: "orga" })

    const result = await createOrganization(formData)
    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("successfully creates an organization", async () => {
    const formData = mockFormData({
      name: "Org A",
      subdomain: "orga",
      description: "Desc",
      website: "https://orga.com",
    })

    // Properly mock $transaction
    prisma.$transaction = jest.fn().mockImplementation(async (callback: any) => {
      const tx = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({
            id: "org-1",
            name: "Org A",
            subdomain: "orga",
            verified: true,
            published: true,
          }),
        },
        member: {
          create: jest.fn().mockResolvedValue({
            id: "mem-1",
            userId: "user-1",
            role: "owner",
            createdAt: new Date(),
          }),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
      }
      return callback(tx)
    }) as any

    const result = await createOrganization(formData)
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it("returns subdomain taken error if findUnique returns a record", async () => {
    const formData = mockFormData({ name: "Org A", subdomain: "orga" })

    prisma.$transaction = jest.fn().mockImplementation(async (callback: any) => {
      const tx = {
        organization: {
          findUnique: jest.fn().mockResolvedValue({ id: "org-1" }), // simulate taken subdomain
          create: jest.fn(),
        },
        member: { create: jest.fn() },
        user: { update: jest.fn() },
      }
      return callback(tx)
    }) as any

    const result = await createOrganization(formData)
    expect(result).toEqual({ error: "This subdomain is already taken" })
  })

  it("returns generic error for other exceptions", async () => {
    const formData = mockFormData({ name: "Org A", subdomain: "orga" })

    prisma.$transaction = jest.fn().mockImplementation(() => {
      throw new Error("DB down")
    }) as any

    const result = await createOrganization(formData)
    expect(result).toEqual({ error: "DB down" })
  })
})

describe("toggleBiopharmaConsentSettings", () => {
  const mockOrganization = {
    id: "org-1",
    name: "Org A",
    description: "Desc",
    subdomain: "orga",
    biopharmaConsentSettings: false,
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("enables biopharmaConsentSettings if it was false", async () => {
    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      biopharmaConsentSettings: true,
    })

    const result = await toggleBiopharmaConsentSettings(mockOrganization)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: mockOrganization.id },
      data: { biopharmaConsentSettings: true },
    })
    expect(addTypeSenseDocument).toHaveBeenCalled()
    expect(deleteTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${mockOrganization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.biopharmaConsentSettings).toBe(true)
  })

  it("disables biopharmaConsentSettings if it was true", async () => {
    const org = { ...mockOrganization, biopharmaConsentSettings: true }
    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...org,
      biopharmaConsentSettings: false,
    })

    const result = await toggleBiopharmaConsentSettings(org)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: org.id },
      data: { biopharmaConsentSettings: false },
    })
    expect(deleteTypeSenseDocument).toHaveBeenCalled()
    expect(addTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${org.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.biopharmaConsentSettings).toBe(false)
  })

  it("returns an error object if prisma update fails", async () => {
    ;(prisma.organization.update as jest.Mock).mockRejectedValue(
      new Error("DB down")
    )

    const result = await toggleBiopharmaConsentSettings(mockOrganization)

    expect(result).toEqual({ error: "DB down" })
    expect(addTypeSenseDocument).not.toHaveBeenCalled()
    expect(deleteTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe("toggleOrganizationPublished", () => {
  const mockOrganization = {
    id: "org-123",
    name: "Test Org",
    description: "Test Desc",
    subdomain: "testorg",
    published: false,
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("publishes an organization if it was unpublished", async () => {
    (prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      published: true,
    })

    const result = await toggleOrganizationPublished(mockOrganization)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: mockOrganization.id },
      data: { published: true },
    })
    expect(addTypeSenseDocument).toHaveBeenCalled()
    expect(deleteTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${mockOrganization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.published).toBe(true)
  })

  it("unpublishes an organization if it was published", async () => {
    const org = { ...mockOrganization, published: true } as any

    (prisma.organization.update as jest.Mock).mockResolvedValue({
      ...org,
      published: false,
    })

    const result = await toggleOrganizationPublished(org)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: org.id },
      data: { published: false },
    })
    expect(prisma.milestone.updateMany).toHaveBeenCalledWith({
      where: { organizationId: org.id },
      data: { private: true },
    })
    expect(deleteTypeSenseDocument).toHaveBeenCalled()
    expect(addTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${org.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.published).toBe(false)
  })

  it("returns an error object if prisma.update fails", async () => {
    (prisma.organization.update as jest.Mock).mockRejectedValue(
      new Error("DB down")
    )

    const result = await toggleOrganizationPublished(mockOrganization)
    expect(result).toEqual({ error: "DB down" })
  })
})

describe("toggleOrganizationVerified", () => {
  const mockOrganization = {
    id: "org-123",
    name: "Test Org",
    description: "Test Desc",
    subdomain: "testorg",
    verified: false,
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("verifies an organization if it was unverified", async () => {
    (prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      verified: true,
    })

    const result = await toggleOrganizationVerified(mockOrganization)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: mockOrganization.id },
      data: { verified: true },
    })
    expect(addTypeSenseDocument).not.toHaveBeenCalled()
    expect(deleteTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${mockOrganization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.verified).toBe(true)
  })

  it("unverifies an organization if it was verified", async () => {
    const org = { ...mockOrganization, verified: true } as any

    (prisma.organization.update as jest.Mock).mockResolvedValue({
      ...org,
      verified: false,
    })

    const result = await toggleOrganizationVerified(org)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: org.id },
      data: { verified: false },
    })
    expect(deleteTypeSenseDocument).not.toHaveBeenCalled()
    expect(addTypeSenseDocument).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      `${org.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`
    )
    expect(result.verified).toBe(false)
  })

  it("returns an error object if prisma.update fails", async () => {
    (prisma.organization.update as jest.Mock).mockRejectedValue(
      new Error("DB down")
    )

    const result = await toggleOrganizationVerified(mockOrganization)
    expect(result).toEqual({ error: "DB down" })
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
