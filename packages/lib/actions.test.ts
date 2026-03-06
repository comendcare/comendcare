jest.mock("@sendgrid/mail", () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}))

jest.mock("nanoid", () => ({
  customAlphabet: jest.fn(),
  nanoid: jest.fn(() => "123abc"), // default mock return value
}))

jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
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

jest.mock("./typesense", () => ({
  updateTypeSenseDocument: jest.fn(),
  deleteTypeSenseDocument: jest.fn(),
}))

// Mock the DB calls
jest.mock("./prisma", () => ({
  default: {
    biosample: {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    diseaseModel: {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    tool: {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn()
    },
    emailCapture: {
      upsert: jest.fn(),
    },
    memberRequest: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    },
    condition: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    conditionToOrganization: {
      create: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
    membership: {
      create: jest.fn(),
    },
    member: { 
      create: jest.fn(),
      findMany: jest.fn(), 
      findUnique: jest.fn(),
      findFirst: jest.fn() ,
      delete: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    },
    milestone: {
      updateMany: jest.fn(),
    },
    roadmap: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    invitation: { 
      findFirst: jest.fn(), 
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    whitelist: { 
      upsert: jest.fn() 
    },
    claimOrganizationInvitation: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    company: {
      findUnique: jest.fn(),
    },
    institution: {
      findUnique: jest.fn(),
    },
    createFacilityRequest: {
      create: jest.fn(),
      update: jest.fn(),
    },
    donor: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("./auth", () => ({
  authOptions: jest.fn(),
  getSession: jest.fn(),
  withAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withOrganizationAuth: <T extends (...args: any[]) => any>(fn: T): T => fn, // bypass authentication (tested separately in auth.test.ts)
  withUserAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
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
  toBiomarkersNested: jest.fn(),
}))

jest.mock("./raw-events", () => ({
  writeRawEvent: jest.fn(),
}))

jest.mock("./server-utils", () => ({
  validateEmailDomain: jest.fn(),
}));

jest.mock("./customerio/customer-io-track", () => ({
  customerIOTrack: jest.fn(),
}));

jest.mock("./customerio/cio-sync-org", () => ({
  cioSyncOrg: jest.fn(),
  cioUpsertOrgMember: jest.fn(),
  cioRemoveOrgMember: jest.fn(),
}));

jest.mock("./customerio/customer-io", () => ({
  cioDeleteUser: jest.fn(),
}))

import prisma from "./prisma"
import { 
  acceptClaimOrganizationInvitation,
  acceptInvitation,
  addEmailCapture, 
  approveMemberRequestAndCreateMember, 
  connectOrganizationToCondition, 
  createBiosample, 
  createClinicalDataset, 
  createCondition, 
  createCreateFacilityRequest, 
  createDiseaseModel, 
  createMemberRequest, 
  createOrganization, 
  declineAndDeleteClaimOrganizationInvitation, 
  declineAndDeleteInvitation, 
  deleteAsset, 
  deleteBiosamples, 
  deleteDiseaseModels, 
  deleteInvitation, 
  deleteMember, 
  deleteMemberRequest, 
  deleteOrganization, 
  deleteRoadmap, 
  deleteUser, 
  denyMemberRequest, 
  editUser, 
  inviteUser, 
  leaveOrganization, 
  setBiosamplesVisibility,
  setDataToolsVisibility,
  setDiseaseModelsVisibility,
  toggleBiopharmaConsentSettings,
  toggleOrganizationPublished,
  toggleOrganizationVerified,
  updateBiosample,
  updateClinicalDataset,
  updateCondition,
  updateCreateFacilityRequest,
  updateDiseaseModel,
  updateMemberWithMemberPermission,
  updateMemberWithOwnerPermission,
  updateOrganization,
  updateRoadmap,
  updateRoadmapMetadata, 
} from "./actions"
import { revalidatePath, revalidateTag } from "next/cache"
import { getSession } from "./auth"
import { sendInviteEmail, sendMemberDeletedEmail, sendMemberRequestApprovedEmail, sendMemberRequestCreatedEmail, sendMemberRequestDeniedEmail } from "./emails"
import { Prisma } from "@prisma/client"
import {
  addTypeSenseDocument,
  deleteTypeSenseDocument,
  toBiomarkersNested,
  updateTypeSenseDocument
} from "./utils"
import { validateEmailDomain } from "./server-utils"
import { customerIOTrack } from "./customerio/customer-io-track"
import { cioRemoveOrgMember, cioSyncOrg, cioUpsertOrgMember } from "./customerio/cio-sync-org"
import { cioDeleteUser } from "./customerio/customer-io"
import { writeRawEvent } from "./raw-events"

// helper to create a FormData mock
const createFormData = (data: Record<string, any>) => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })

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
    const formData = createFormData({ name: "Condition A" })

    const result = await createCondition(formData)

    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("successfully upserts a condition with comma-separated arrays", async () => {
    const formData = createFormData({
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
    const formData = createFormData({
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
    const formData = createFormData({ name: "Condition C", summary: "Test" })
    ;(prisma.condition.upsert as jest.Mock).mockResolvedValue(null)

    const result = await createCondition(formData)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })

  it("returns duplicate error for Prisma P2002", async () => {
    const formData = createFormData({ name: "Condition D", summary: "Test" })
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
    const formData = createFormData({ name: "Condition E", summary: "Test" })
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

describe("updateOrganization", () => {
  const mockOrganization = {
    id: "org-123",
    name: "Test Org",
    description: "Old description",
    verified: true,
    published: true,
  } as any

  beforeEach(() => {
    jest.clearAllMocks()

    prisma.organization.findUnique = jest.fn()
    prisma.organization.update = jest.fn()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user-1", name: "Test User" },
    })
  })

  it("updates organization with parsed FormData", async () => {
    const formData = createFormData({
      name: "New Org",
      yearFounded: "2020",
      therapeuticsInDevelopment: "drug1,drug2",
      therapeuticsOfInterest: "drug3",
      metadata: JSON.stringify({ a: 1 }),
      employees: "10",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      name: "New Org",
      employees: 10,
      therapeuticsInDevelopment: ["drug1", "drug2"],
      therapeuticsOfInterest: ["drug3"],
      metadata: { a: 1 },
    })

    const result = await updateOrganization(mockOrganization, formData)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: "org-123" },
      data: {
        name: "New Org",
        yearFounded: "2020",
        therapeuticsInDevelopment: ["drug1", "drug2"],
        therapeuticsOfInterest: ["drug3"],
        metadata: { a: 1 },
        employees: 10,
      },
    })

    expect(result.name).toBe("New Org")
  })

  it("converts empty image fields to null", async () => {
    const formData = createFormData({
      image: "",
      headerImage: "",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      image: null,
      headerImage: null,
    })

    await updateOrganization(mockOrganization, formData)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: "org-123" },
      data: {
        image: null,
        headerImage: null,
      },
    })
  })

  it("converts empty string fields to null", async () => {
    const formData = createFormData({
      description: "",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      description: null,
    })

    await updateOrganization(mockOrganization, formData)

    expect(prisma.organization.update).toHaveBeenCalledWith({
      where: { id: "org-123" },
      data: {
        description: null,
      },
    })
  })

  it("calls TypeSense update when org is verified and published", async () => {
    const formData = createFormData({
      name: "Updated Org",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      name: "Updated Org",
      verified: true,
      published: true,
    })

    await updateOrganization(mockOrganization, formData)

    expect(updateTypeSenseDocument).toHaveBeenCalled()
  })

  it("does not call TypeSense if org is not published", async () => {
    const formData = createFormData({
      name: "Updated Org",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockResolvedValue({
      ...mockOrganization,
      name: "Updated Org",
      verified: true,
      published: false,
    })

    await updateOrganization(mockOrganization, formData)

    expect(updateTypeSenseDocument).not.toHaveBeenCalled()
  })

  it("handles prisma errors", async () => {
    const formData = createFormData({
      name: "Fail Org",
    });

    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization)

    ;(prisma.organization.update as jest.Mock).mockRejectedValue(
      new Error("Database failure")
    )

    await expect(
      updateOrganization(mockOrganization, formData)
    ).rejects.toThrow("Database failure")
  })
})

describe("deleteOrganization", () => {
  const mockOrg = { id: "org-123" } as any;
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue({
      user: { id: userId },
    });
  });

  it("returns error if not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce(null);

    const result = await deleteOrganization(mockOrg);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("deletes organization successfully", async () => {
    (prisma.member.findMany as jest.Mock).mockResolvedValue([
      { organizationId: "org-456", createdAt: new Date() },
    ]);

    (prisma.$transaction as jest.Mock).mockImplementation(async ([orgDelete, userUpdate]) => [
      { id: "org-123" }, // deletedOrg
      { id: "user-1", activeOrganizationId: "org-456" },
    ]);

    (deleteTypeSenseDocument as jest.Mock).mockResolvedValue(undefined);
    (prisma.condition.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: "user-2" }]);
    (prisma.member.findFirst as jest.Mock).mockResolvedValue({ organizationId: "org-456" });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: "user-2" });

    const result = await deleteOrganization(mockOrg);

    expect(result).toEqual({ success: true, data: { id: "org-123" } });
    expect(deleteTypeSenseDocument).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("handles error in transaction and throws", async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(
      new Error("DB failed")
    );

    await expect(deleteOrganization(mockOrg)).rejects.toThrow("DB failed");
  });

  it("handles no remaining memberships correctly", async () => {
    (prisma.member.findMany as jest.Mock).mockResolvedValue([]); // no memberships

    (prisma.$transaction as jest.Mock).mockImplementation(async ([orgDelete, userUpdate]) => [
      { id: "org-123" },
      { id: "user-1", activeOrganizationId: null },
    ]);

    (deleteTypeSenseDocument as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteOrganization(mockOrg);

    expect(result).toEqual({ success: true, data: { id: "org-123" } });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { activeOrganizationId: null },
    });
  });
})

describe("updateRoadmap", () => {
  const mockOrg = {
    id: "org-123",
    subdomain: "testorg",
    customDomain: "custom.org",
  }

  const mockRoadmap = {
    id: "roadmap-1",
    organization: mockOrg,
    links: [{ id: "link-1", link: "oldlink.com", name: "Old Link" }],
    partners: [{ id: "partner-1", name: "Old Partner", email: "old@example.com" }],
    slug: "roadmap-slug",
  }

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the root domain
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "next-public-root-domain";
    process.env.NEXT_PUBLIC_NODE_ENV = "development"; // ensure dev env for consistency
  })

  it("returns error if user is not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null)

    const result = await updateRoadmap("org-123", { id: "roadmap-1" })
    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("returns error if roadmap not found", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } })
    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await updateRoadmap("org-123", { id: "roadmap-1" })
    expect(result).toEqual({ error: "Roadmap not found" })
  })

  it("updates roadmap and revalidates tags", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } })
    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(mockRoadmap)

    const updatedData = {
      id: "roadmap-1",
      title: "New Title",
      description: "New Desc",
      private: true,
      links: [
        { id: "link-1", link: "updatedlink.com", name: "Updated Link" },
        { id: "link-2", link: "newlink.com", name: "New Link" },
      ],
      partners: [
        { id: "partner-1", name: "Updated Partner", email: "new@example.com" },
        { id: "partner-2", name: "New Partner", email: "new2@example.com" },
      ],
    };

    (prisma.roadmap.update as jest.Mock).mockImplementation(async (args) => {
      return { ...mockRoadmap, ...args.data, links: args.data.links?.create || [], partners: args.data.partners?.create || [] }
    })

    const result = await updateRoadmap("org-123", updatedData)

    // Prisma update is called with correct deletes/updates/creates
    expect(prisma.roadmap.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "roadmap-1" },
        data: expect.objectContaining({
          title: "New Title",
          description: "New Desc",
          links: expect.objectContaining({
            deleteMany: undefined,
            update: [
              { where: { id: "link-1" }, data: { link: "updatedlink.com", name: "Updated Link" } },
            ],
            create: [
              { link: "newlink.com", name: "New Link" },
            ],
          }),
          partners: expect.objectContaining({
            update: [
              { where: { id: "partner-1" }, data: { name: "Updated Partner", email: "new@example.com", role: undefined, affiliation: undefined } },
            ],
            create: [
              { name: "New Partner", email: "new2@example.com", role: undefined, affiliation: undefined },
            ],
          }),
        }),
      }),
    )

    // Revalidate tags called for both subdomain and custom domain
    expect(revalidateTag).toHaveBeenCalledWith("testorg.next-public-root-domain-roadmap")
    expect(revalidateTag).toHaveBeenCalledWith("testorg.next-public-root-domain-roadmap-slug")
    expect(revalidateTag).toHaveBeenCalledWith("custom.org-roadmaps")
    expect(revalidateTag).toHaveBeenCalledWith("custom.org-roadmap-slug")

    expect(result).toEqual(
      expect.objectContaining({
        title: "New Title",
        description: "New Desc",
        links: [
          { link: "newlink.com", name: "New Link" },
        ],
        partners: [
          { name: "New Partner", email: "new2@example.com" },
        ],
      })
    )
  })

  it("returns error on prisma failure", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } })
    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(mockRoadmap)
    ;(prisma.roadmap.update as jest.Mock).mockRejectedValue(new Error("DB failed"))

    const result = await updateRoadmap("org-123", { id: "roadmap-1" })
    expect(result).toEqual({ error: "DB failed" })
  })
})

describe("updateRoadmapMetadata", () => {
  const mockRoadmap = {
    id: "roadmap-123",
    slug: "roadmap-slug",
    organization: { subdomain: "testorg", customDomain: "custom.org" },
  } as any

  const mockOrganization = { id: "org-1" } as any

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com"
    ;(getSession as jest.Mock).mockResolvedValue({ user: { id: "user-1" } })
  })

  it("updates a non-image field successfully", async () => {
    const formData = new Map([
      ["title", "New Title"],
    ])
    const fakeFormData = {
      get: (key: string) => formData.get(key),
    } as unknown as FormData

    ;(prisma.roadmap.update as jest.Mock).mockResolvedValue({
      ...mockRoadmap,
      title: "New Title",
    })

    const result = await updateRoadmapMetadata(mockOrganization, fakeFormData, mockRoadmap, "title")

    expect(prisma.roadmap.update).toHaveBeenCalledWith({
      where: { id: mockRoadmap.id },
      data: { title: "New Title" },
    })

    // Check revalidation
    expect(revalidateTag).toHaveBeenCalledWith("testorg.example.com-roadmaps")
    expect(revalidateTag).toHaveBeenCalledWith("testorg.example.com-roadmap-slug")
    expect(revalidateTag).toHaveBeenCalledWith("custom.org-roadmaps")
    expect(revalidateTag).toHaveBeenCalledWith("custom.org-roadmap-slug")

    expect(result).toEqual({
      ...mockRoadmap,
      title: "New Title",
    
    })
  })

  it("returns error if slug is already in use (P2002)", async () => {
    const fakeFormData = {
      get: (key: string) => "some-slug",
    } as unknown as FormData

    ;(prisma.roadmap.update as jest.Mock).mockRejectedValue({ code: "P2002" })

    const result = await updateRoadmapMetadata(mockOrganization, fakeFormData, mockRoadmap, "slug")
    expect(result).toEqual({ error: "This slug is already in use" })
  })

  it("returns generic error on other failures", async () => {
    const fakeFormData = {
      get: (key: string) => "value",
    } as unknown as FormData

    ;(prisma.roadmap.update as jest.Mock).mockRejectedValue(new Error("DB failed"))

    const result = await updateRoadmapMetadata(mockOrganization, fakeFormData, mockRoadmap, "title")
    expect(result).toEqual({ error: "DB failed" })
  })
})

describe("deleteRoadmap", () => {
  const mockOrganization = { id: "org-1" } as any
  const mockRoadmap = { id: "roadmap-123" } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes a roadmap successfully", async () => {
    ;(prisma.roadmap.delete as jest.Mock).mockResolvedValue({
      organizationId: mockOrganization.id,
    })

    const result = await deleteRoadmap(mockOrganization, mockRoadmap)

    expect(prisma.roadmap.delete).toHaveBeenCalledWith({
      where: { id: mockRoadmap.id },
      select: { organizationId: true },
    })
    expect(result).toEqual({ organizationId: mockOrganization.id })
  })

  it("returns an error object when deletion fails", async () => {
    ;(prisma.roadmap.delete as jest.Mock).mockRejectedValue(new Error("DB failed"))

    const result = await deleteRoadmap(mockOrganization, mockRoadmap)

    expect(prisma.roadmap.delete).toHaveBeenCalledWith({
      where: { id: mockRoadmap.id },
      select: { organizationId: true },
    })
    expect(result).toEqual({ error: "DB failed" })
  })
})

describe("editUser", () => {
  const mockData = { name: "New Name" };
  const mockUser = { id: "user-123", name: "Old Name" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates user successfully and revalidates paths", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });
    (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, ...mockData });

    const result = await editUser(null, mockData);

    expect(getSession).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: mockData,
    });
    expect(result).toEqual({ ...mockUser, ...mockData });
  });

  it("returns an error if user is not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await editUser(null, mockData);

    expect(result).toEqual({ error: "Not authenticated" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("returns a unique constraint error if P2002 is thrown", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });
    (prisma.user.update as jest.Mock).mockRejectedValue({ code: "P2002" });

    const result = await editUser(null, mockData);

    expect(result).toEqual({ error: "This name is already in use" });
  });

  it("returns a generic error if another Prisma error occurs", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-123" } });
    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB failed"));

    const result = await editUser(null, mockData);

    expect(result).toEqual({ error: "DB failed" });
  });
})

describe("inviteUser", () => {
  const mockOrg = { id: "org-1", name: "Test Org", image: "org.png" } as any;
  const mockSession = {
    user: { id: "user-1", email: "inviter@test.com", membership: { role: "owner" } },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (validateEmailDomain as jest.Mock).mockResolvedValue(true);
    (prisma.member.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.invitation.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.invitation.create as jest.Mock).mockResolvedValue({ id: "inv-123", email: "new@test.com", role: "member", organizationId: "org-1" });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ name: "Inviter Name", email: "inviter@test.com", image: "" });
    (prisma.whitelist.upsert as jest.Mock).mockResolvedValue({ email: "new@test.com" });
    (sendInviteEmail as jest.Mock).mockResolvedValue(true);
  });

  it("returns error if not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await inviteUser(mockOrg, "new@test.com", "member", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "You must be signed in to perform this action." });
  });

  it("returns error if a member tries to invite non-members", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: { id: "user-1", email: "member@test.com", membership: { role: "member" } } });
    const result = await inviteUser(mockOrg, "new@test.com", "owner", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "Members can only invite other members." });
  });

  it("returns error if inviting self", async () => {
    const result = await inviteUser(mockOrg, "inviter@test.com", "member", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "Cannot send invitation to yourself." });
  });

  it("returns error if email domain is invalid", async () => {
    (validateEmailDomain as jest.Mock).mockResolvedValue(false);
    const result = await inviteUser(mockOrg, "invalid@test.com", "member", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "Email domain is invalid or cannot receive emails." });
  });

  it("returns error if user is already a member", async () => {
    (prisma.member.findFirst as jest.Mock).mockResolvedValue({ id: "member-1" });
    const result = await inviteUser(mockOrg, "existing@test.com", "member", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "User is already a member of this organization." });
  });

  it("returns error if invitation already exists", async () => {
    (prisma.invitation.findFirst as jest.Mock).mockResolvedValue({ id: "inv-1" });
    const result = await inviteUser(mockOrg, "invited@test.com", "member", "127.0.0.1");
    expect(result).toEqual({ success: false, error: "An invitation has already been sent to this email." });
  });

  it("creates invitation and sends email successfully", async () => {
    const result = await inviteUser(mockOrg, "new@test.com", "member", "127.0.0.1");

    expect(prisma.invitation.create).toHaveBeenCalledWith({
      data: { email: "new@test.com", role: "member", organizationId: "org-1" },
    });

    expect(customerIOTrack).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      event: "organization_invitation_sent",
      properties: expect.objectContaining({ invitation_id: "inv-123", invitee_email: "new@test.com" }),
    }));

    expect(prisma.whitelist.upsert).toHaveBeenCalledWith({
      where: { email: "new@test.com" },
      update: {},
      create: { email: "new@test.com" },
    });

    expect(sendInviteEmail).toHaveBeenCalledWith(expect.objectContaining({
      invitee: expect.objectContaining({ email: "new@test.com" }),
      inviter: expect.objectContaining({ name: "Inviter Name" }),
    }));

    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");

    expect(result).toEqual({ success: true, data: { id: "inv-123", email: "new@test.com", role: "member", organizationId: "org-1" } });
  });

  it("returns generic database error if something fails", async () => {
    (prisma.invitation.create as jest.Mock).mockRejectedValue(new Error("DB failed"));

    const result = await inviteUser(mockOrg, "new@test.com", "member", "127.0.0.1");

    expect(result).toEqual({ success: false, error: "Database error. please try again later." });
  });
})

describe("approveMemberRequestAndCreateMember", () => {
  const mockOrg = { id: "org-1", subdomain: "testorg", name: "Test Org", image: "org.png" } as any;
  const mockMemberRequest = {
    id: "req-1",
    userId: "user-1",
    organizationId: "org-1",
    email: "newuser@test.com",
    user: { name: "New User", image: "" },
  } as any;
  const mockCreatedMember = {
    id: "member-1",
    userId: "user-1",
    email: "newuser@test.com",
    role: "member",
    createdAt: new Date(),
    user: { name: "New User", image: "" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.memberRequest.update as jest.Mock).mockResolvedValue({ approved: true });
    (prisma.member.create as jest.Mock).mockResolvedValue(mockCreatedMember);
    (cioSyncOrg as jest.Mock).mockResolvedValue(true);
    (cioUpsertOrgMember as jest.Mock).mockResolvedValue(true);
    (sendMemberRequestApprovedEmail as jest.Mock).mockResolvedValue(true);
  });

  it("throws if memberRequest is invalid", async () => {
    await expect(
      approveMemberRequestAndCreateMember(mockOrg, null as any)
    ).rejects.toThrow("Invalid member request");
  });

  it("returns error if member already exists", async () => {
    (prisma.member.findUnique as jest.Mock).mockResolvedValue({ id: "member-1" });
    const result = await approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest);
    expect(result).toEqual({ success: false, error: "This member already exists in your organization." });
    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
  });

  it("creates member and approves request successfully", async () => {
    const result = await approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest);

    expect(prisma.memberRequest.update).toHaveBeenCalledWith({
      where: { id: "req-1" },
      data: { approved: true },
    });

    expect(prisma.member.create).toHaveBeenCalledWith({
      data: {
        email: "newuser@test.com",
        organizationId: "org-1",
        role: "member",
        userId: "user-1",
      },
      include: { user: true },
    });

    expect(cioSyncOrg).toHaveBeenCalledWith({
      subdomain: "testorg",
      name: "Test Org",
      description: undefined,
    });

    expect(cioUpsertOrgMember).toHaveBeenCalledWith({
      orgSubdomain: "testorg",
      userId: "user-1",
      role: "member",
      joinedAt: expect.any(Date),
    });

    expect(sendMemberRequestApprovedEmail).toHaveBeenCalledWith({
      name: "New User",
      email: "newuser@test.com",
      image: "",
      organizationName: "Test Org",
      organizationImage: "org.png",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");

    expect(result).toEqual({ success: true, data: mockCreatedMember });
  });

  it("returns error if member creation fails", async () => {
    (prisma.member.create as jest.Mock).mockResolvedValue(null);
    const result = await approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest);
    expect(result).toEqual({ success: false, error: "Database error. please try again later." });
  });

  it("handles CIO sync failure gracefully", async () => {
    (cioSyncOrg as jest.Mock).mockRejectedValue(new Error("CIO failure"));
    const result = await approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest);
    expect(result).toEqual({ success: true, data: mockCreatedMember });
    expect(sendMemberRequestApprovedEmail).toHaveBeenCalled();
  });

  it("throws error if member existence check fails", async () => {
    (prisma.member.findUnique as jest.Mock).mockRejectedValue(new Error("DB failed"));
    await expect(approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest))
      .rejects.toThrow("Failed to check if member already exists.");
  });

  it("throws error if creation fails unexpectedly", async () => {
    (prisma.memberRequest.update as jest.Mock).mockRejectedValue(new Error("DB failed"));
    await expect(approveMemberRequestAndCreateMember(mockOrg, mockMemberRequest))
      .rejects.toThrow("Failed to add member to organization.");
  });
})

describe("deleteMemberRequest", () => {
  const mockUser = { id: "user-1", name: "Test User" } as any;
  const mockMemberRequest = {
    id: "req-1",
    userId: "user-2",
    organizationId: "org-1",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws if memberRequest is invalid", async () => {
    await expect(deleteMemberRequest(mockUser, null as any))
      .rejects.toThrow("Invalid member request");
  });

  it("deletes member request successfully", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(mockMemberRequest);

    const result = await deleteMemberRequest(mockUser, mockMemberRequest);

    expect(prisma.memberRequest.delete).toHaveBeenCalledWith({
      where: { id: "req-1" },
    });

    expect(result).toEqual({ success: true, data: mockMemberRequest });
  });

  it("returns failure if deletion returns null", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(null);

    const result = await deleteMemberRequest(mockUser, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete member request. Request not found.",
    });
  });

  it("returns failure if deletion throws an error", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await deleteMemberRequest(mockUser, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete member request.",
    });
  });
})

describe("denyMemberRequest", () => {
  const mockOrganization = { id: "org-1", name: "Test Org" } as any;
  const mockMemberRequest = {
    id: "req-1",
    userId: "user-1",
    email: "test@example.com",
    user: { name: "Test User", image: "image.png" },
    organizationId: "org-1",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws if memberRequest is invalid", async () => {
    await expect(denyMemberRequest(mockOrganization, null as any))
      .rejects.toThrow("Invalid member request");
  });

  it("returns success if deletion and email succeed", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(mockMemberRequest);
    (sendMemberRequestDeniedEmail as jest.Mock).mockResolvedValue(true);

    const result = await denyMemberRequest(mockOrganization, mockMemberRequest);

    expect(prisma.memberRequest.delete).toHaveBeenCalledWith({
      where: { id: mockMemberRequest.id },
      include: { user: true },
    });

    expect(sendMemberRequestDeniedEmail).toHaveBeenCalledWith({
      name: mockMemberRequest.user.name,
      email: mockMemberRequest.email,
      image: mockMemberRequest.user.image,
      organizationName: mockOrganization.name,
      organizationImage: "",
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");

    expect(result).toEqual({ success: true, data: mockMemberRequest });
  });

  it("returns failure if deletion returns null", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(null);

    const result = await denyMemberRequest(mockOrganization, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete member request. Request not found.",
    });
  });

  it("returns failure if deletion throws an error", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await denyMemberRequest(mockOrganization, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete member request.",
    });
  });

  it("returns failure if organization is missing", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(mockMemberRequest);

    const result = await denyMemberRequest(null as any, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Organization not found.",
    });
  });

  it("returns failure if sending denial email fails", async () => {
    (prisma.memberRequest.delete as jest.Mock).mockResolvedValue(mockMemberRequest);
    (sendMemberRequestDeniedEmail as jest.Mock).mockRejectedValue(new Error("Email failed"));

    const result = await denyMemberRequest(mockOrganization, mockMemberRequest);

    expect(result).toEqual({
      success: false,
      error: "Failed to send denial email.",
    });
  });
})

describe("deleteInvitation", () => {
  const mockInvitation = {
    id: "inv-1",
    organizationId: "org-1",
    email: "invitee@example.com",
    role: "member",
  } as any;

  const mockSession = { user: { id: "user-1" } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it("throws if invitation is invalid", async () => {
    await expect(deleteInvitation({} as any, null as any)).rejects.toThrow("Invalid invitation");
  });

  it("returns success if deletion succeeds", async () => {
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(mockInvitation);
    (customerIOTrack as jest.Mock).mockResolvedValue(true);

    const result = await deleteInvitation({} as any, mockInvitation);

    expect(customerIOTrack).toHaveBeenCalledWith(expect.objectContaining({
      event: "organization_invitation_revoked",
      properties: expect.objectContaining({
        invitation_id: mockInvitation.id,
        organization_id: mockInvitation.organizationId,
        invitee_email: mockInvitation.email,
        role: mockInvitation.role,
        revoked_by_user_id: mockSession.user.id,
      }),
    }));

    expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: mockInvitation.id } });
    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");

    expect(result).toEqual({ success: true, data: mockInvitation });
  });

  it("returns failure if deletion returns null", async () => {
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(null);

    const result = await deleteInvitation({} as any, mockInvitation);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete invitation. Request not found.",
    });
  });

  it("returns failure if deletion throws an error", async () => {
    (prisma.invitation.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await deleteInvitation({} as any, mockInvitation);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete invitation.",
    });
  });

  it("logs error if customerIOTrack throws but deletion still succeeds", async () => {
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(mockInvitation);
    (customerIOTrack as jest.Mock).mockRejectedValue(new Error("CIO fail"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await deleteInvitation({} as any, mockInvitation);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[CIO] track organization_invitation_revoked failed:",
      expect.any(Error)
    );

    expect(result).toEqual({ success: true, data: mockInvitation });

    consoleSpy.mockRestore();
  });
})

describe("declineAndDeleteClaimOrganizationInvitation", () => {
  const invitationId = "inv-1";
  const mockInvitation = {
    id: invitationId,
    email: "invitee@example.com",
    organizationId: "org-1",
    role: "member",
  } as any;

  const mockSession = { user: { id: "user-1", email: "invitee@example.com" } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it("returns failure if invitation email does not match session email", async () => {
    (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue({
      ...mockInvitation,
      email: "other@example.com",
    });

    const result = await declineAndDeleteClaimOrganizationInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Error declining invitation: active user email does not match the invite email."
    });
  });

  it("returns success if deletion succeeds", async () => {
    (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.claimOrganizationInvitation.delete as jest.Mock).mockResolvedValue(mockInvitation);

    const result = await declineAndDeleteClaimOrganizationInvitation(invitationId);

    expect(prisma.claimOrganizationInvitation.delete).toHaveBeenCalledWith({ where: { id: invitationId } });
    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
    expect(result).toEqual({ success: true, data: mockInvitation });
  });

  it("returns failure if deletion returns null", async () => {
    (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.claimOrganizationInvitation.delete as jest.Mock).mockResolvedValue(null);

    const result = await declineAndDeleteClaimOrganizationInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete claim organization invitation. Request not found."
    });
  });

  it("returns failure if deletion throws an error", async () => {
    (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.claimOrganizationInvitation.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await declineAndDeleteClaimOrganizationInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete claim organization invitation."
    });
  });
})

describe("declineAndDeleteInvitation", () => {
  const invitationId = "inv-1";
  const mockInvitation = {
    id: invitationId,
    email: "invitee@example.com",
    organizationId: "org-1",
    role: "member",
  } as any;

  const mockSession = { user: { id: "user-1", email: "invitee@example.com" } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it("returns failure if invitation email does not match session email", async () => {
    (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
      ...mockInvitation,
      email: "other@example.com",
    });

    const result = await declineAndDeleteInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Error declining invitation: active user email does not match the invite email."
    });
  });

  it("calls customerIOTrack and deletes invitation successfully", async () => {
    (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(mockInvitation);

    const result = await declineAndDeleteInvitation(invitationId);

    expect(customerIOTrack).toHaveBeenCalledWith(expect.objectContaining({
      event: "organization_invitation_declined",
      properties: expect.objectContaining({
        invitation_id: invitationId,
        organization_id: "org-1",
        invitee_email: "invitee@example.com",
        role: "member",
      }),
    }));

    expect(prisma.invitation.delete).toHaveBeenCalledWith({ where: { id: invitationId } });
    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");

    expect(result).toEqual({ success: true, data: mockInvitation });
  });

  it("returns failure if deletion returns null", async () => {
    (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(null);

    const result = await declineAndDeleteInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete invitation. Request not found."
    });
  });

  it("returns failure if deletion throws an error", async () => {
    (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.invitation.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await declineAndDeleteInvitation(invitationId);

    expect(result).toEqual({
      success: false,
      error: "Failed to delete invitation."
    });
  });

  it("logs error but continues if customerIOTrack fails", async () => {
    (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
    (prisma.invitation.delete as jest.Mock).mockResolvedValue(mockInvitation);
    (customerIOTrack as jest.Mock).mockRejectedValue(new Error("Track error"));

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await declineAndDeleteInvitation(invitationId);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[CIO] track organization_invitation_declined failed:',
      expect.any(Error)
    );

    expect(result).toEqual({ success: true, data: mockInvitation });
    consoleErrorSpy.mockRestore();
  });
})

describe("leaveOrganization", () => {
  const org = { id: "org-1", subdomain: "testorg" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce(null);

    const result = await leaveOrganization(org);
    expect(result).toEqual({ success: false, error: "Session not found." });
  });

  it("returns error if membership not found", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await leaveOrganization(org);
    expect(result).toEqual({ success: false, error: "Membership not found." });
  });

  it("prevents last owner from leaving", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce({ id: "m-1", role: "owner" } as any);
    (prisma.member.count as jest.Mock).mockResolvedValueOnce(1);

    const result = await leaveOrganization(org);
    expect(result).toEqual({
      success: false,
      error: "You are the last owner and cannot leave the organization. Assign another owner first.",
    });
  });

  // it("leaves organization successfully for normal member", async () => {
  //   (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
  //   (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce({ id: "m-1", role: "member" } as any);
  //   (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ activeOrganizationId: "org-1" } as any);
  //   (prisma.member.findFirst as jest.Mock).mockResolvedValueOnce({ organizationId: "org-2" } as any);
  //   (prisma.$transaction as jest.Mock).mockResolvedValueOnce([{ id: "m-1" } as any]);

  //   const result = await leaveOrganization(org);

  //   expect(result).toEqual({ success: true, data: { id: "m-1" } });
  //   expect(cioRemoveOrgMember).toHaveBeenCalledWith({ orgSubdomain: "testorg", userId: "user-1" });
  //   expect(revalidatePath).toHaveBeenCalled();
  // });

  // it("logs CIO error but still succeeds", async () => {
  //   (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
  //   (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce({ id: "m-1", role: "member" } as any);
  //   (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({ activeOrganizationId: "org-1" } as any);
  //   (prisma.member.findFirst as jest.Mock).mockResolvedValueOnce({ organizationId: "org-2" } as any);
  //   (prisma.$transaction as jest.Mock).mockResolvedValueOnce([{ id: "m-1" } as any]);
  //   (cioRemoveOrgMember as jest.Mock).mockRejectedValueOnce(new Error("CIO down"));

  //   const result = await leaveOrganization(org);
  //   expect(result.success).toBe(true);
  //   expect(cioRemoveOrgMember).toHaveBeenCalled();
  // });

  // it("logs and returns generic error on internal failure", async () => {
  //   (getSession as jest.Mock).mockRejectedValueOnce(new Error("unexpected"));

  //   const result = await leaveOrganization(org);
  //   expect(result).toEqual({ success: false, error: "Internal server error" });
  // });
})

describe("updateMemberWithMemberPermission", () => {
  const org = { id: "org-1" } as any;
  const membershipId = "member-1";
  const updateData = { title: "New Title" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce(null);

    const result = await updateMemberWithMemberPermission(org, membershipId, updateData);

    expect(result).toEqual({ success: false, error: "Session not found." });
  });

  it("returns error if membership not found", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await updateMemberWithMemberPermission(org, membershipId, updateData);

    expect(result).toEqual({ success: false, error: "Membership not found." });
  });

  it("updates membership successfully", async () => {
    const mockMember = { id: membershipId, title: "Old Title", user: { id: "user-1" } };
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce(mockMember as any);
    (prisma.member.update as jest.Mock).mockResolvedValueOnce({ ...mockMember, title: "New Title" } as any);

    const result = await updateMemberWithMemberPermission(org, membershipId, updateData);

    expect(result).toEqual({
      success: true,
      data: { ...mockMember, title: "New Title" },
    });

    expect(prisma.member.update).toHaveBeenCalledWith({
      where: { id: membershipId },
      include: { user: true },
      data: { title: "New Title" },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
  });
})

describe("updateMemberWithOwnerPermission", () => {
  const org = { id: "org-1" } as any;
  const membershipId = "member-1";
  const updateData = { title: "New Title", role: "member" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce(null);

    const result = await updateMemberWithOwnerPermission(org, membershipId, updateData);

    expect(result).toEqual({ success: false, error: "Session not found." });
  });

  it("returns error if membership not found", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const result = await updateMemberWithOwnerPermission(org, membershipId, updateData);

    expect(result).toEqual({ success: false, error: "Membership not found." });
  });

  it("prevents last owner demotion", async () => {
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce({ id: membershipId, role: "owner" } as any);
    (prisma.member.count as jest.Mock).mockResolvedValueOnce(1); // Only 1 owner left

    const result = await updateMemberWithOwnerPermission(org, membershipId, updateData);

    expect(result).toEqual({
      success: false,
      error: "You are the last owner. Assign another owner before changing your role.",
    });
  });

  it("updates membership successfully", async () => {
    const mockMember = { id: membershipId, title: "Old Title", role: "owner", user: { id: "user-1" } };
    (getSession as jest.Mock).mockResolvedValueOnce({ user: { id: "user-1" } } as any);
    (prisma.member.findUnique as jest.Mock).mockResolvedValueOnce(mockMember as any);
    (prisma.member.count as jest.Mock).mockResolvedValueOnce(2); // More than 1 owner
    (prisma.member.update as jest.Mock).mockResolvedValueOnce({ ...mockMember, title: "New Title", role: "member" } as any);

    const result = await updateMemberWithOwnerPermission(org, membershipId, updateData);

    expect(result).toEqual({
      success: true,
      data: { ...mockMember, title: "New Title", role: "member" },
    });

    expect(prisma.member.update).toHaveBeenCalledWith({
      where: { id: membershipId },
      include: { user: true },
      data: updateData,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/team");
    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
  });
})

describe("deleteMember", () => {
  const mockSession = { user: { id: "user1" } };
  const mockMembership = {
    id: "membership1",
    user: { id: "user1", activeOrganizationId: "org1", name: "Alice", email: "alice@example.com" },
    organization: { id: "org1", name: "Test Org", image: "image.png", subdomain: "testorg" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.member.delete as jest.Mock).mockResolvedValue(mockMembership);
    (prisma.member.findFirst as jest.Mock).mockResolvedValue({ organizationId: "org2" });
    (prisma.user.update as jest.Mock).mockResolvedValue({});
    (cioRemoveOrgMember as jest.Mock).mockResolvedValue({});
    (sendMemberDeletedEmail as jest.Mock).mockResolvedValue({});
    (revalidatePath as jest.Mock).mockImplementation(() => {});
  });

  it("deletes the member and updates active organization", async () => {
    const result = await deleteMember({} as any, "membership1");

    expect(prisma.member.delete).toHaveBeenCalledWith({
      where: { id: "membership1" },
      include: {
        user: { select: { id: true, activeOrganizationId: true, name: true, email: true } },
        organization: { select: { id: true, name: true, image: true, subdomain: true } },
      },
    });

    expect(prisma.member.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user1",
        organizationId: { not: "org1" },
      },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { activeOrganizationId: "org2" },
    });

    expect(cioRemoveOrgMember).toHaveBeenCalledWith({
      orgSubdomain: "testorg",
      userId: "user1",
    });

    expect(revalidatePath).toHaveBeenCalled(); // at least once
    expect(result).toEqual({ success: true, data: mockMembership });
  });

  it("returns an error if session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await deleteMember({} as any, "membership1");

    expect(result).toEqual({ success: false, error: "Session not found." });
  });

  it("handles errors gracefully", async () => {
    (prisma.member.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await deleteMember({} as any, "membership1");

    expect(result).toEqual({ success: false, error: "Internal server error" });
  });
})

describe("deleteUser", () => {
  const mockSession = { user: { id: "user1" } };
  const mockUser = { id: "user1", name: "Alice", email: "alice@example.com" };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
    (cioDeleteUser as jest.Mock).mockResolvedValue({});
  });

  it("deletes the user successfully", async () => {
    const result = await deleteUser();

    expect(getSession).toHaveBeenCalled();
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user1" },
    });
    expect(cioDeleteUser).toHaveBeenCalledWith("user1", { suppress: true });
    expect(result).toEqual({ success: true, data: mockUser });
  });

  it("returns error if session is missing", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await deleteUser();

    expect(result).toEqual({ success: false, error: "Internal server error" });
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("returns error if user not found", async () => {
    (prisma.user.delete as jest.Mock).mockResolvedValue(null);

    const result = await deleteUser();

    expect(result).toEqual({ success: false, error: "user not found" });
  });

  it("handles Prisma errors gracefully", async () => {
    (prisma.user.delete as jest.Mock).mockRejectedValue(new Error("DB error"));

    const result = await deleteUser();

    expect(result).toEqual({ success: false, error: "Internal server error" });
  });
})

// describe("acceptClaimOrganizationInvitation", () => {
//   const mockSession = { user: { id: "user1", email: "alice@example.com", name: "Alice" } };
//   const mockInvitation = {
//     id: "inv1",
//     email: "alice@example.com",
//     accepted: false,
//     role: "member",
//     organization: {
//       id: "org1",
//       name: "Org One",
//       image: "img.png",
//       subdomain: "orgone",
//       members: [],
//       verified: true,
//     },
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (getSession as jest.Mock).mockResolvedValue(mockSession);
//     (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
//     (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}]);
//     (cioSyncOrg as jest.Mock).mockResolvedValue({});
//     (cioUpsertOrgMember as jest.Mock).mockResolvedValue({});
//   });

//   it("accepts a valid claim organization invitation", async () => {
//     const result = await acceptClaimOrganizationInvitation("inv1");

//     expect(getSession).toHaveBeenCalled();
//     expect(prisma.claimOrganizationInvitation.findUnique).toHaveBeenCalledWith({
//       where: { id: "inv1" },
//       include: { organization: { select: expect.any(Object) } },
//     });
//     expect(prisma.$transaction).toHaveBeenCalled();
//     expect(cioSyncOrg).toHaveBeenCalledWith({
//       subdomain: "orgone",
//       name: "Org One",
//       description: undefined,
//     });
//     expect(cioUpsertOrgMember).toHaveBeenCalledWith({
//       orgSubdomain: "orgone",
//       userId: "user1",
//       role: "member",
//       joinedAt: expect.any(Date),
//     });
//     expect(revalidatePath).toHaveBeenCalledTimes(2);
//     expect(result).toEqual({ success: true, data: mockInvitation });
//   });

//   it("returns error if session is missing", async () => {
//     (getSession as jest.Mock).mockResolvedValue(null);
//     const result = await acceptClaimOrganizationInvitation("inv1");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/must be signed in/);
//   });

//   it("returns error if email does not match", async () => {
//     (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue({
//       ...mockInvitation,
//       email: "wrong@example.com",
//     });
//     const result = await acceptClaimOrganizationInvitation("inv1");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/active user email does not match/);
//   });

//   it("returns error if invitation is missing or already accepted", async () => {
//     (prisma.claimOrganizationInvitation.findUnique as jest.Mock).mockResolvedValue({
//       ...mockInvitation,
//       accepted: true,
//     });
//     const result = await acceptClaimOrganizationInvitation("inv1");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/failed to follow organization/);
//   });

//   it("logs error if transaction fails", async () => {
//     (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB fail"));
//     const result = await acceptClaimOrganizationInvitation("inv1");

//     expect(result.success).toBe(false);
//   });
// });

// describe("acceptInvitation", () => {
//   const mockSession = { user: { id: "user1", email: "bob@example.com", name: "Bob" } };
//   const mockInvitation = {
//     id: "inv2",
//     email: "bob@example.com",
//     accepted: false,
//     role: "member",
//     organization: {
//       id: "org2",
//       name: "Org Two",
//       image: "img2.png",
//       subdomain: "orgtwo",
//     },
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (getSession as jest.Mock).mockResolvedValue(mockSession);
//     (prisma.invitation.findUnique as jest.Mock).mockResolvedValue(mockInvitation);
//     (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}, {}]);
//     (cioSyncOrg as jest.Mock).mockResolvedValue({});
//     (cioUpsertOrgMember as jest.Mock).mockResolvedValue({});
//     (customerIOTrack as jest.Mock).mockResolvedValue({});
//     (writeRawEvent as jest.Mock).mockResolvedValue({});
//   });

//   it("accepts a valid invitation", async () => {
//     const result = await acceptInvitation("inv2");

//     expect(getSession).toHaveBeenCalled();
//     expect(prisma.invitation.findUnique).toHaveBeenCalledWith({
//       where: { id: "inv2" },
//       include: { organization: { select: expect.any(Object) } },
//     });
//     expect(prisma.$transaction).toHaveBeenCalled();
//     expect(cioSyncOrg).toHaveBeenCalled();
//     expect(cioUpsertOrgMember).toHaveBeenCalled();
//     expect(customerIOTrack).toHaveBeenCalled();
//     expect(writeRawEvent).toHaveBeenCalled();
//     expect(revalidatePath).toHaveBeenCalledTimes(2);
//     expect(result).toEqual({ success: true, data: mockInvitation });
//   });

//   it("returns error if session is missing", async () => {
//     (getSession as jest.Mock).mockResolvedValue(null);
//     const result = await acceptInvitation("inv2");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/must be signed in/);
//   });

//   it("returns error if email does not match", async () => {
//     (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
//       ...mockInvitation,
//       email: "wrong@example.com",
//     });
//     const result = await acceptInvitation("inv2");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/active user email does not match/);
//   });

//   it("returns error if invitation already accepted", async () => {
//     (prisma.invitation.findUnique as jest.Mock).mockResolvedValue({
//       ...mockInvitation,
//       accepted: true,
//     });
//     const result = await acceptInvitation("inv2");

//     expect(result.success).toBe(false);
//     expect(result.error).toMatch(/failed to follow organization/);
//   });

//   it("logs error if transaction fails", async () => {
//     (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB fail"));
//     const result = await acceptInvitation("inv2");

//     expect(result.success).toBe(false);
//   });
// });


describe("updateCondition", () => {
  const mockOrg = { id: "org1" };
  const mockFormData = new FormData();
  mockFormData.append("name", "Diabetes");
  mockFormData.append("biomarkers", JSON.stringify([{ name: "Glucose" }]));

  beforeEach(() => {
    jest.clearAllMocks();
    (toBiomarkersNested as jest.Mock).mockReturnValue({
      createMany: [{ name: "Glucose" }],
    });
  });

  it("creates a new condition if no link exists", async () => {
    (prisma.conditionToOrganization.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.condition.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.condition.create as jest.Mock).mockResolvedValue({ id: "cond1", name: "Diabetes" });
    (prisma.conditionToOrganization.create as jest.Mock).mockResolvedValue({});

    const result = await updateCondition(mockOrg as any, mockFormData);

    expect(prisma.condition.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Diabetes",
          biomarkers: { createMany: [{ name: "Glucose" }] },
        }),
      })
    );

    expect(prisma.conditionToOrganization.create).toHaveBeenCalledWith({
      data: { conditionId: "cond1", organizationId: "org1" },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
    expect(result).toEqual({ success: true, data: { id: "cond1", name: "Diabetes" } });
  });

  it("updates an existing condition link", async () => {
    (prisma.conditionToOrganization.findFirst as jest.Mock).mockResolvedValue({ conditionId: "cond1" });
    (prisma.condition.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.condition.update as jest.Mock).mockResolvedValue({ id: "cond1", name: "Diabetes Updated" });

    const updatedFormData = new FormData();
    updatedFormData.append("name", "Diabetes Updated");

    const result = await updateCondition(mockOrg as any, updatedFormData);

    expect(prisma.condition.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cond1" },
        data: expect.objectContaining({ name: "Diabetes Updated" }),
      })
    );

    expect(revalidatePath).toHaveBeenCalledWith("/app/profile");
    expect(result).toEqual({ success: true, data: { id: "cond1", name: "Diabetes Updated" } });
  });

  it("handles condition name collision and updates link via upsert", async () => {
    (prisma.conditionToOrganization.findFirst as jest.Mock).mockResolvedValue({ conditionId: "cond1" });
    (prisma.condition.findUnique as jest.Mock).mockResolvedValueOnce({ id: "cond2" }); // same name exists
    (prisma.conditionToOrganization.upsert as jest.Mock).mockResolvedValue({});
    (prisma.condition.update as jest.Mock).mockResolvedValue({ id: "cond2", name: "Diabetes" });

    const collisionFormData = new FormData();
    collisionFormData.append("name", "Diabetes");

    const result = await updateCondition(mockOrg as any, collisionFormData);

    expect(prisma.conditionToOrganization.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { conditionId_organizationId: { conditionId: "cond1", organizationId: "org1" } },
        update: { conditionId: "cond2" },
        create: { conditionId: "cond2", organizationId: "org1" },
      })
    );

    expect(prisma.condition.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "cond2" } })
    );

    expect(result).toEqual({ success: true, data: { id: "cond2", name: "Diabetes" } });
  });

  it("returns error if prisma call fails", async () => {
    (prisma.conditionToOrganization.findFirst as jest.Mock).mockRejectedValue(new Error("DB fail"));

    const result = await updateCondition(mockOrg as any, mockFormData);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/DB fail/);
  });
});

describe("deleteAsset", () => {
  const mockOrg = { id: "org1" };

  it("deletes tools successfully", async () => {
    (prisma.tool.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

    const result = await deleteAsset(mockOrg as any, ["tool1", "tool2"]);

    expect(prisma.tool.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["tool1", "tool2"] } },
    });
    expect(result).toEqual({ count: 2 });
  });

  it("throws error if delete fails", async () => {
    (prisma.tool.deleteMany as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await expect(deleteAsset(mockOrg as any, ["tool1"])).rejects.toThrow("DB fail");
  });
});

describe("deleteBiosamples", () => {
  const mockOrg = { id: "org1" };

  it("deletes biosamples successfully", async () => {
    (prisma.biosample.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

    const result = await deleteBiosamples(mockOrg as any, ["sample1", "sample2", "sample3"]);

    expect(prisma.biosample.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["sample1", "sample2", "sample3"] } },
    });
    expect(result).toEqual({ count: 3 });
  });

  it("throws error if delete fails", async () => {
    (prisma.biosample.deleteMany as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await expect(deleteBiosamples(mockOrg as any, ["sample1"])).rejects.toThrow("DB fail");
  });
});

describe("deleteDiseaseModels", () => {
  const mockOrg = { id: "org1" };

  it("deletes disease models successfully", async () => {
    (prisma.diseaseModel.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    const result = await deleteDiseaseModels(mockOrg as any, ["model1"]);

    expect(prisma.diseaseModel.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["model1"] } },
    });
    expect(result).toEqual({ count: 1 });
  });

  it("throws error if delete fails", async () => {
    (prisma.diseaseModel.deleteMany as jest.Mock).mockRejectedValue(new Error("DB fail"));

    await expect(deleteDiseaseModels(mockOrg as any, ["model1"])).rejects.toThrow("DB fail");
  });
});

describe("setDiseaseModelsVisibility", () => {
  const mockOrganization = { id: "org1" } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update disease models visibility and revalidate path", async () => {
    const mockIds = ["dm1", "dm2"];
    const mockIsPrivate = true;

    // Mock prisma response
    (prisma.diseaseModel.updateMany as jest.Mock).mockResolvedValue({
      count: mockIds.length,
    });

    const result = await setDiseaseModelsVisibility(mockOrganization, mockIds, mockIsPrivate);

    // Check prisma call
    expect(prisma.diseaseModel.updateMany).toHaveBeenCalledWith({
      where: { id: { in: mockIds } },
      data: { private: mockIsPrivate },
    });

    // Check revalidatePath call
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/disease-models");

    // Check result
    expect(result).toEqual({ count: mockIds.length });
  });

  it("should throw an error if organization id is missing", async () => {
    await expect(
      setDiseaseModelsVisibility({} as any, ["dm1"], true)
    ).rejects.toThrow("No organization id provided.");
  });

  it("should throw an error if prisma.updateMany fails", async () => {
    (prisma.diseaseModel.updateMany as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(
      setDiseaseModelsVisibility(mockOrganization, ["dm1"], false)
    ).rejects.toThrow("DB error");
  });
});

describe("updateDiseaseModel", () => {
  const mockOrganization = { id: "org1" } as any;
  const mockFormData = {
    id: "dm1",
    types: [{ value: "type1" }],
    description: "Test description",
    genes: [{ value: "GENE1" }],
    storageFacility: [{ value: "inst1" }],
    attachments: [{ link: "link1" }],
    contacts: [{ name: "contact1", email: "test@example.com" }],
    milestones: [{ id: "ms1" }],
    isPrivate: true,
  } as any;

  it("should update disease model successfully", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: "inst1" });
    (prisma.company.findUnique as jest.Mock).mockResolvedValue({ id: "comp1" });
    (prisma.diseaseModel.update as jest.Mock).mockResolvedValue(mockFormData);
    (prisma.diseaseModel.findUnique as jest.Mock).mockResolvedValue(mockFormData);

    const result = await updateDiseaseModel(mockOrganization, mockFormData);

    expect(prisma.diseaseModel.update).toHaveBeenCalled();
    expect(prisma.diseaseModel.findUnique).toHaveBeenCalledWith({ where: { id: mockFormData.id } });
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/disease-models");
    expect(result).toEqual(mockFormData);
  });

  it("should throw if organization id is missing", async () => {
    await expect(updateDiseaseModel({} as any, mockFormData)).rejects.toThrow("No organization id provided.");
  });

  it("should throw if disease model id is missing", async () => {
    await expect(updateDiseaseModel(mockOrganization, { ...mockFormData, id: undefined })).rejects.toThrow(
      "No biosample id provided."
    );
  });

  it("should throw if prisma.update fails", async () => {
    (prisma.diseaseModel.update as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(updateDiseaseModel(mockOrganization, mockFormData)).rejects.toThrow("DB error");
  });
});

describe("createDiseaseModel", () => {
  const mockOrganization = { id: "org1" } as any;
  const mockFormData = {
    id: "dm1",
    types: [{ value: "type1" }],
    description: "Test description",
    genes: [{ value: "GENE1" }],
    storageFacility: [{ value: "inst1" }],
    attachments: [{ link: "link1" }],
    contacts: [{ name: "contact1", email: "test@example.com" }],
    milestones: [{ id: "ms1" }],
    isPrivate: true,
  } as any;

  it("should create disease model successfully", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: "inst1" });
    (prisma.company.findUnique as jest.Mock).mockResolvedValue({ id: "comp1" });
    (prisma.diseaseModel.create as jest.Mock).mockResolvedValue(mockFormData);

    const result = await createDiseaseModel(mockOrganization, mockFormData);

    expect(prisma.diseaseModel.create).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/disease-models");
    expect(result).toEqual(mockFormData);
  });

  it("should throw if organization id is missing", async () => {
    await expect(createDiseaseModel({} as any, mockFormData)).rejects.toThrow("No organization id provided.");
  });

  it("should throw if prisma.create fails", async () => {
    (prisma.diseaseModel.create as jest.Mock).mockRejectedValue(new Error("DB create error"));

    await expect(createDiseaseModel(mockOrganization, mockFormData)).rejects.toThrow("DB create error");
  });
});

describe("createClinicalDataset", () => {
  const mockOrganization = { id: "org1", name: "Org Name", subdomain: "orgsub" } as any;
  const mockSession = { user: { id: "user1", name: "Test User" } } as any;
  const mockData = {
    id: "tool1",
    title: "Dataset Title",
    types: [{ value: "type1" }],
    description: "Test description",
    storageFacility: [{ value: "inst1" }],
    attachments: [{ link: "link1", name: "Attachment1" }],
    contacts: [{ name: "contact1", email: "test@example.com" }],
    milestones: [{ id: "ms1" }],
    isPrivate: true,
    cohortSize: "10",
    genes: [{ value: "GENE1" }],
    otherTypeDetails: "other details",
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
  });

  it("should create a clinical dataset successfully", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: "inst1" });
    (prisma.company.findUnique as jest.Mock).mockResolvedValue({ id: "comp1" });
    (prisma.tool.create as jest.Mock).mockResolvedValue(mockData);

    const result = await createClinicalDataset(mockOrganization, mockData);

    // Prisma create called
    expect(prisma.tool.create).toHaveBeenCalled();

    // Institution/company findUnique called
    expect(prisma.institution.findUnique).toHaveBeenCalledWith({ where: { id: "inst1" } });
    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id: "inst1" } });

    // Revalidate path called
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/data");

    // Customer.io tracking called
    expect(customerIOTrack).toHaveBeenCalledWith(expect.objectContaining({
      userId: mockSession.user.id,
      event: 'org_toolkit_item_added',
      properties: expect.objectContaining({ itemId: mockData.id }),
    }));

    expect(result).toEqual(mockData);
  });

  it("should throw if organization id is missing", async () => {
    await expect(createClinicalDataset({} as any, mockData)).rejects.toThrow("No organization id provided.");
  });

  it("should throw if prisma.create fails", async () => {
    (prisma.tool.create as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(createClinicalDataset(mockOrganization, mockData)).rejects.toThrow("DB error");
  });
});

describe("setDataToolsVisibility", () => {
  const mockOrganization = { id: "org1" } as any;
  const mockIds = ["tool1", "tool2"];
  const mockResult = { count: 2 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update visibility of data tools successfully", async () => {
    (prisma.tool.updateMany as jest.Mock).mockResolvedValue(mockResult);

    const result = await setDataToolsVisibility(mockOrganization, mockIds, true);

    expect(prisma.tool.updateMany).toHaveBeenCalledWith({
      where: { id: { in: mockIds } },
      data: { private: true },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/data");
    expect(result).toEqual(mockResult);
  });

  it("should throw an error if organization id is missing", async () => {
    await expect(setDataToolsVisibility({} as any, mockIds, true))
      .rejects.toThrow("No organization id provided.");
  });

  it("should throw an error if prisma.updateMany fails", async () => {
    (prisma.tool.updateMany as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(setDataToolsVisibility(mockOrganization, mockIds, true))
      .rejects.toThrow("DB error");
  });
});

describe("updateClinicalDataset", () => {
  const mockOrganization = { id: "org1" } as any;
  const mockData = {
    id: "tool1",
    title: "Test Dataset",
    types: [{ value: "type1" }],
    otherTypeDetails: "details",
    isPrivate: true,
    milestones: [{ id: "ms1" }],
    description: "description",
    attachments: [{ link: "link1" }],
    contacts: [{ name: "John Doe", email: "john@example.com" }],
    genes: [{ value: "gene1" }],
    cohortSize: "5",
    storageFacility: [{ value: "inst1" }],
    notes: "Some notes",
  };

  const mockUpdatedTool = { id: "tool1", title: "Updated Dataset" };
  const mockFoundInstitution = { id: "inst1", name: "Institution" };
  const mockFoundCompany = { id: "comp1", name: "Company" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a clinical dataset successfully", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(mockFoundInstitution);
    (prisma.company.findUnique as jest.Mock).mockResolvedValue(mockFoundCompany);
    (prisma.tool.update as jest.Mock).mockResolvedValue(mockUpdatedTool);
    (prisma.tool.findUnique as jest.Mock).mockResolvedValue(mockUpdatedTool);

    const result = await updateClinicalDataset(mockOrganization, mockData as any);

    expect(prisma.institution.findUnique).toHaveBeenCalledWith({ where: { id: "inst1" } });
    expect(prisma.company.findUnique).toHaveBeenCalledWith({ where: { id: "inst1" } });
    expect(prisma.tool.update).toHaveBeenCalled();
    expect(prisma.tool.findUnique).toHaveBeenCalledWith({ where: { id: "tool1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/data");
    expect(result).toEqual(mockUpdatedTool);
  });

  it("should throw error if organization id is missing", async () => {
    await expect(updateClinicalDataset({} as any, mockData as any))
      .rejects.toThrow("No organization id provided.");
  });

  it("should throw error if data tool id is missing", async () => {
    const dataWithoutId = { ...mockData, id: undefined };
    await expect(updateClinicalDataset(mockOrganization, dataWithoutId as any))
      .rejects.toThrow("No data tool id provided.");
  });

  it("should throw error if prisma.tool.update fails", async () => {
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(mockFoundInstitution);
    (prisma.company.findUnique as jest.Mock).mockResolvedValue(mockFoundCompany);
    (prisma.tool.update as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(updateClinicalDataset(mockOrganization, mockData as any))
      .rejects.toThrow("DB error");
  });
});

describe("updateCreateFacilityRequest", () => {
  const mockOrganization = { id: "org1" } as any;

  const mockData = {
    id: "req1",
    name: "New Facility Request",
    milestoneId: "ms1",
    biosampleId: "bs1",
    diseaseModelId: "dm1",
    clinicalDatasetId: "cd1",
  };

  const mockResponse = {
    id: "req1",
    name: "New Facility Request",
    milestone: { id: "ms1" },
    biosample: { id: "bs1" },
    diseaseModel: { id: "dm1" },
    clinicalDataset: { id: "cd1" },
  };

  it("should update a facility request successfully", async () => {
    (prisma.createFacilityRequest.update as jest.Mock).mockResolvedValue(mockResponse);

    const result = await updateCreateFacilityRequest(mockOrganization, mockData);

    expect(prisma.createFacilityRequest.update).toHaveBeenCalledWith({
      where: { id: mockData.id },
      include: {
        milestone: true,
        biosample: true,
        diseaseModel: true,
        clinicalDataset: true,
      },
      data: {
        name: mockData.name,
        milestone: { connect: { id: mockData.milestoneId } },
        biosample: { connect: { id: mockData.biosampleId } },
        diseaseModel: { connect: { id: mockData.diseaseModelId } },
        clinicalDataset: { connect: { id: mockData.clinicalDatasetId } },
      },
    });

    expect(result).toEqual(mockResponse);
  });

  it("should update without optional ids", async () => {
    const dataWithoutIds = { id: "req2", name: "Request 2" };
    const responseWithoutIds = { ...dataWithoutIds, milestone: null, biosample: null, diseaseModel: null, clinicalDataset: null };
    (prisma.createFacilityRequest.update as jest.Mock).mockResolvedValue(responseWithoutIds);

    const result = await updateCreateFacilityRequest(mockOrganization, dataWithoutIds as any);

    expect(prisma.createFacilityRequest.update).toHaveBeenCalledWith({
      where: { id: dataWithoutIds.id },
      include: {
        milestone: true,
        biosample: true,
        diseaseModel: true,
        clinicalDataset: true,
      },
      data: { name: dataWithoutIds.name },
    });

    expect(result).toEqual(responseWithoutIds);
  });

  it("should throw if prisma update fails", async () => {
    (prisma.createFacilityRequest.update as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(updateCreateFacilityRequest(mockOrganization, mockData)).rejects.toThrow("DB error");
  });
});

describe("createCreateFacilityRequest", () => {  
  const mockOrganization = { id: "org1" } as any;

  const mockData = {
    id: "req1",
    name: "New Facility Request",
    milestoneId: "ms1",
    biosampleId: "bs1",
    diseaseModelId: "dm1",
    clinicalDatasetId: "cd1",
  };

  const mockResponse = {
    id: "req1",
    name: "New Facility Request",
    milestone: { id: "ms1" },
    biosample: { id: "bs1" },
    diseaseModel: { id: "dm1" },
    clinicalDataset: { id: "cd1" },
  };

  it("should create a facility request successfully", async () => {
    (prisma.createFacilityRequest.create as jest.Mock).mockResolvedValue(mockResponse);

    const result = await createCreateFacilityRequest(mockOrganization, mockData);

    expect(prisma.createFacilityRequest.create).toHaveBeenCalledWith({
      include: {
        milestone: true,
        biosample: true,
        diseaseModel: true,
        clinicalDataset: true,
      },
      data: {
        name: mockData.name,
        milestone: { connect: { id: mockData.milestoneId } },
        biosample: { connect: { id: mockData.biosampleId } },
        diseaseModel: { connect: { id: mockData.diseaseModelId } },
        clinicalDataset: { connect: { id: mockData.clinicalDatasetId } },
      },
    });

    expect(result).toEqual(mockResponse);
  });

  it("should create without optional ids", async () => {
    const dataWithoutIds = { name: "Request 2" };
    const responseWithoutIds = { id: "req2", name: "Request 2", milestone: null, biosample: null, diseaseModel: null, clinicalDataset: null };
    (prisma.createFacilityRequest.create as jest.Mock).mockResolvedValue(responseWithoutIds);

    const result = await createCreateFacilityRequest(mockOrganization, dataWithoutIds as any);

    expect(prisma.createFacilityRequest.create).toHaveBeenCalledWith({
      include: {
        milestone: true,
        biosample: true,
        diseaseModel: true,
        clinicalDataset: true,
      },
      data: { name: dataWithoutIds.name },
    });

    expect(result).toEqual(responseWithoutIds);
  });

  it("should throw if prisma create fails", async () => {
    (prisma.createFacilityRequest.create as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(createCreateFacilityRequest(mockOrganization, mockData)).rejects.toThrow("DB error");
  });
});

describe("createBiosample", () => {
  const mockOrganization = { id: "org1", name: "OrgName", subdomain: "orgsub", image: "image.png" } as any;

  const mockData = {
    id: "bs1",
    types: [{ value: "cell_line" }],
    description: "Test biosample",
    genes: [{ value: "TP53" }],
    storageFacility: [{ value: "inst1" }],
    milestones: [{ id: "ms1" }],
    attachments: [{ link: "link1", name: "Attachment 1" }],
    contacts: [{ name: "John", email: "john@test.com" }],
    internalDonorId: "donor1",
  } as any;

  const mockSession = { user: { id: "user1", name: "Test User" } } as any;
  const mockBiosampleResponse = { id: "bs1", private: false, description: "Test biosample" } as any;
  const mockDonor = { id: "donor123" };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: "inst1" });
    (prisma.company.findUnique as jest.Mock).mockResolvedValue({ id: "comp1" });
  });

  it("should create a biosample and connect existing donor", async () => {
    (prisma.biosample.create as jest.Mock).mockResolvedValue(mockBiosampleResponse);
    (prisma.donor.findFirst as jest.Mock).mockResolvedValue(mockDonor);
    (prisma.biosample.update as jest.Mock).mockResolvedValue(mockBiosampleResponse);

    const result = await createBiosample(mockOrganization, mockData);

    expect(prisma.biosample.create).toHaveBeenCalled();
    expect(prisma.donor.findFirst).toHaveBeenCalledWith({
      where: { internalId: mockData.internalDonorId, organizationId: mockOrganization.id },
    });
    expect(prisma.biosample.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { donor: { connect: { id: mockDonor.id } } },
      })
    );
    expect(result).toEqual(mockBiosampleResponse);
    expect(writeRawEvent).toHaveBeenCalled();
    expect(customerIOTrack).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/biosample");
  });

  it("should throw error if organization id is missing", async () => {
    await expect(
      createBiosample({} as any, mockData)
    ).rejects.toThrow("No organization id provided.");
  });

  it("should throw error if prisma create fails", async () => {
    (prisma.biosample.create as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(createBiosample(mockOrganization, mockData)).rejects.toThrow("DB error");
  });
});

describe("setBiosamplesVisibility", () => {
  const mockOrganization = { id: "org1", name: "OrgName" } as any;
  const mockIds = ["bs1", "bs2"];
  const mockIsPrivate = true;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update biosamples visibility successfully", async () => {
    const mockResponse = { count: 2 };
    (prisma.biosample.updateMany as jest.Mock).mockResolvedValue(mockResponse);

    const result = await setBiosamplesVisibility(mockOrganization, mockIds, mockIsPrivate);

    expect(prisma.biosample.updateMany).toHaveBeenCalledWith({
      where: { id: { in: mockIds } },
      data: { private: mockIsPrivate },
    });

    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/biosample");
    expect(result).toEqual(mockResponse);
  });

  it("should throw an error if organization id is missing", async () => {
    await expect(setBiosamplesVisibility({} as any, mockIds, mockIsPrivate)).rejects.toThrow(
      "No organization id provided."
    );
  });

  it("should throw an error if prisma updateMany fails", async () => {
    (prisma.biosample.updateMany as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(setBiosamplesVisibility(mockOrganization, mockIds, mockIsPrivate)).rejects.toThrow(
      "DB error"
    );
  });
});
