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

jest.mock("./typesense", () => ({
  updateTypeSenseDocument: jest.fn(),
  deleteTypeSenseDocument: jest.fn(),
}))

jest.mock("./prisma", () => {
  const biosample = {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  }
  const diseaseModel = {
    update: jest.fn(),
    findUnique: jest.fn(),
  }
  const tool = {
    update: jest.fn(),
    findUnique: jest.fn(),
  }
  const company = { findUnique: jest.fn() }
  const institution = { findUnique: jest.fn() }
  const emailCapture = { upsert: jest.fn() }
  const memberRequest = {findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const organization = {create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), findMany: jest.fn(), findFirst: jest.fn()}
  const condition = {upsert: jest.fn(), deleteMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), create: jest.fn()}
  const conditionToOrganization = {create: jest.fn(), findFirst: jest.fn(), upsert: jest.fn()}
  const membership = {create: jest.fn()}
  const member = {create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), delete: jest.fn(), count: jest.fn(), update: jest.fn()}
  const user = {update: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn()}
  const milestone = {updateMany: jest.fn(), count: jest.fn(), update: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), delete: jest.fn()}
  const node = {create: jest.fn(), update: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn()}
  const edge = {create: jest.fn(), update: jest.fn(), findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), upsert: jest.fn()}
  const roadmap = {create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const invitation = {findFirst: jest.fn(), create: jest.fn(), delete: jest.fn(), findUnique: jest.fn()}
  const whitelist = {upsert: jest.fn()}
  const claimOrganizationInvitation = {findUnique: jest.fn(), delete: jest.fn()}
  const createFacilityRequest = {create: jest.fn(), update: jest.fn()}
  const donor = {findFirst: jest.fn(), update: jest.fn()}
  const rFP = {update: jest.fn(), delete: jest.fn(), create: jest.fn(), upsert: jest.fn(), findUnique: jest.fn()}
  const platformNotification = {update: jest.fn(), create: jest.fn(), createMany: jest.fn(), findMany: jest.fn()}
  const review = {findUnique: jest.fn(), delete: jest.fn()}
  const reviewFeedback = {findUnique: jest.fn(), update: jest.fn(), create: jest.fn()}
  const savedCompany = {findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const savedOrganization = {findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const companyContactRequest = {findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const pharmaProject = {findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()}
  const materialAndDataAccessRequest = {create: jest.fn(), update: jest.fn()}
  const subscription = {findFirst: jest.fn(), create: jest.fn()}
  const tagAssignment = {deleteMany: jest.fn()}
  const $transaction = jest.fn()

  // Return exactly what your code expects
  return {
    __esModule: true,
    default: {
      biosample,
      diseaseModel,
      tool,
      company,
      institution,
      emailCapture,
      memberRequest,
      organization,
      condition,
      conditionToOrganization,
      membership,
      member,
      user,
      milestone,
      node,
      edge,
      roadmap,
      invitation,
      whitelist,
      claimOrganizationInvitation,
      createFacilityRequest,
      donor,
      rFP,
      platformNotification,
      review,
      reviewFeedback,
      savedCompany,
      savedOrganization,
      companyContactRequest,
      pharmaProject,
      materialAndDataAccessRequest,
      subscription,
      tagAssignment,
      $transaction,
    },
  };
});

jest.mock("./auth", () => ({
  authOptions: jest.fn(),
  getSession: jest.fn(),
  withAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withOrganizationAuth: <T extends (...args: any[]) => any>(fn: T): T => fn, // bypass authentication (tested separately in auth.test.ts)
  withUserAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
}));

jest.mock("comend-researcher-hub/lib/auth", () => ({
  withResearcherAuth: (fn: any) => fn,
}))

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

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

import prisma from "./prisma"
import { 
  acceptClaimOrganizationInvitation,
  acceptInvitation,
  addEmailCapture, 
  approveMemberRequestAndCreateMember, 
  connectOrganizationToCondition, 
  contactCRO, 
  createBiosample, 
  createClinicalDataset, 
  createCondition, 
  createCreateFacilityRequest, 
  createDiseaseModel, 
  createMaterialAndDataAccessRequest, 
  createMemberRequest, 
  createMilestones, 
  createNodes, 
  createNodesAndEdgesFromTemplate, 
  createNotification, 
  createNotifications, 
  createOrganization, 
  createOrUpdateRFP, 
  createPharmaProject, 
  createReview, 
  createRoadmap, 
  declineAndDeleteClaimOrganizationInvitation, 
  declineAndDeleteInvitation, 
  deleteAsset, 
  deleteBiosamples, 
  deleteDiseaseModels, 
  deleteInvitation, 
  deleteMember, 
  deleteMemberRequest, 
  deleteNode, 
  deleteOrganization, 
  deletePharmaProject, 
  deleteReview, 
  deleteRFP, 
  deleteRoadmap, 
  deleteUser, 
  denyMemberRequest, 
  editReview, 
  editSavedCRO, 
  editUser, 
  inviteUser, 
  leaveOrganization, 
  moveNodes, 
  notificationsViewed, 
  saveCRO, 
  saveOrganization, 
  setBiosamplesVisibility,
  setDataToolsVisibility,
  setDiseaseModelsVisibility,
  submitFeedback,
  subscribeToOrganization,
  switchOrganization,
  syncDBRFPs,
  toggleBiopharmaConsentSettings,
  toggleOrganizationPublished,
  toggleOrganizationVerified,
  unsaveCRO,
  unsaveOrganization,
  updateBiosample,
  updateClinicalDataset,
  updateCondition,
  updateCreateFacilityRequest,
  updateDBFlow,
  updateDiseaseModel,
  updateEdges,
  updateEntityTags,
  updateMaterialAndDataAccessRequestProperty,
  updateMemberWithMemberPermission,
  updateMemberWithOwnerPermission,
  updateMilestones,
  updateMilestonesVisibility,
  updateOrganization,
  updateRoadmap,
  updateRoadmapMetadata, 
} from "./actions"
import { revalidatePath, revalidateTag } from "next/cache"
import { getSession } from "./auth"
import { sendInviteEmail, sendMemberDeletedEmail, sendMemberRequestApprovedEmail, sendMemberRequestCreatedEmail, sendMemberRequestDeniedEmail, sendProviderContactRequestEmail } from "./emails"
import { Prisma } from "@prisma/client"
import {
  addTypeSenseDocument,
  deleteTypeSenseDocument,
  normalizeTag,
  toBiomarkersNested,
  updateTypeSenseDocument
} from "./utils"
import { validateEmailDomain } from "./server-utils"
import { customerIOTrack } from "./customerio/customer-io-track"
import { cioRemoveOrgMember, cioSyncOrg, cioUpsertOrgMember } from "./customerio/cio-sync-org"
import { cioDeleteUser } from "./customerio/customer-io"
import { writeRawEvent } from "./raw-events"
import { getServerSession } from "next-auth/next"

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

describe("updateBiosample", () => {
  const organization = {
    id: "org1",
    name: "Test Org",
    subdomain: "test",
    image: "logo.png",
  } as any

  const baseData: any = {
    id: "bio1",
    types: [{ value: "blood" }],
    otherTypeDetails: "",
    description: "Test biosample",
    attachments: [],
    contacts: [],
    milestones: [],
    isPrivate: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: {
        id: "user1",
        name: "Test User",
      },
    })
  })

  it("throws if organization id is missing", async () => {
    await expect(
      updateBiosample({} as any, baseData)
    ).rejects.toThrow("No organization id provided.")
  })

  it("throws if biosample id is missing", async () => {
    await expect(
      updateBiosample(organization, { ...baseData, id: undefined })
    ).rejects.toThrow("No biosample id provided.")
  })

  it("throws if biosample does not exist", async () => {
    ;(prisma.biosample.findUnique as jest.Mock).mockResolvedValueOnce(null as any)

    await expect(updateBiosample(organization, baseData)).rejects.toThrow(
      "Biosample not found."
    )
  })

  it("updates biosample successfully", async () => {
    ;(prisma.biosample.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: "bio1",
        private: true,
      } as any) // existing lookup
      .mockResolvedValueOnce({
        id: "bio1",
      } as any) // response lookup

    ;(prisma.biosample.update as jest.Mock).mockResolvedValue({
      id: "bio1",
      private: true,
    } as any)

    const result = await updateBiosample(organization, baseData)

    expect(prisma.biosample.update).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith("/app/tools/biosample")
    expect(result).toEqual({ id: "bio1" })
  })

  it("emits event when biosample becomes public", async () => {
    ;(prisma.biosample.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: "bio1",
        private: true,
      } as any)
      .mockResolvedValueOnce({
        id: "bio1",
      } as any)

    ;(prisma.biosample.update as jest.Mock).mockResolvedValue({
      id: "bio1",
      private: false,
      description: "Test biosample",
      availability: "available",
      types: [],
    } as any)

    await updateBiosample(organization, baseData)

    expect(writeRawEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "org_updated_tool",
        externalId: "bio1",
        payload: expect.objectContaining({
          orgId: "org1",
          private: false,
        }),
      })
    )
  })

  it("does not emit event if biosample already public", async () => {
    ;(prisma.biosample.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: "bio1",
        private: false,
      } as any)
      .mockResolvedValueOnce({
        id: "bio1",
      } as any)

    ;(prisma.biosample.update as jest.Mock).mockResolvedValue({
      id: "bio1",
      private: false,
    } as any)

    await updateBiosample(organization, baseData)

    expect(writeRawEvent).not.toHaveBeenCalled()
  })

  it("updates donor if donorId is provided", async () => {
    ;(prisma.biosample.findUnique as jest.Mock)
      .mockResolvedValueOnce({
        id: "bio1",
        private: true,
      } as any)
      .mockResolvedValueOnce({
        id: "bio1",
      } as any)

    ;(prisma.biosample.update as jest.Mock).mockResolvedValue({
      id: "bio1",
      private: true,
    } as any)

    const dataWithDonor = {
      ...baseData,
      donorId: "donor1",
      sex: "female",
    }

    await updateBiosample(organization, dataWithDonor)

    expect(prisma.donor.update as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "donor1" },
      })
    )
  })
})

describe("deleteRFP", () => {
  const mockOrganization = {
    id: "org1",
    name: "Test Org",
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deletes an RFP and returns the response", async () => {
    const mockRFP = {
      id: "rfp1",
      contacts: [],
      attachments: [],
      milestones: [],
    }

    ;(prisma.rFP.delete as jest.Mock).mockResolvedValue(mockRFP as any)

    const result = await deleteRFP(mockOrganization, "rfp1")

    expect(prisma.rFP.delete).toHaveBeenCalledWith({
      where: { id: "rfp1" },
      include: {
        contacts: true,
        attachments: true,
        milestones: {
          include: {
            milestone: {
              include: {
                types: { include: { milestoneType: true } },
              },
            },
          },
        },
      },
    })

    expect(result).toEqual(mockRFP)
  })

  it("throws an error if prisma delete fails", async () => {
    ;(prisma.rFP.delete as jest.Mock).mockRejectedValue(new Error("Database error"))

    await expect(deleteRFP(mockOrganization, "rfp1")).rejects.toThrow(
      "Database error"
    )
  })
})

describe("createOrUpdateRFP", () => {
  const organization = {
    id: "org1",
    name: "Test Org",
    subdomain: "test",
    image: "logo.png",
  } as any

  const actor = {
    userId: "user1",
    userName: "Test User",
  }

  beforeEach(() => {
    jest.clearAllMocks()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1", name: "Test User" },
    })
  })

  it("throws if organization id is missing", async () => {
    await expect(
      createOrUpdateRFP({} as any, {})
    ).rejects.toThrow("No organization id provided.")
  })

  it("creates a new RFP", async () => {
    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue(null)

    const mockResponse = {
      id: "rfp1",
      title: "Test RFP",
      private: true,
      startDate: null,
      endDate: null,
      organization: { name: "Test Org" },
    }

    ;(prisma.rFP.upsert as jest.Mock).mockResolvedValue(mockResponse as any)

    const result = await createOrUpdateRFP(
      organization,
      { title: "Test RFP", private: true },
      actor
    )

    expect(prisma.rFP.upsert).toHaveBeenCalled()
    expect(result).toEqual(mockResponse)

    expect(writeRawEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "org_created_rfp",
        externalId: "rfp1",
      })
    )
  })

  it("updates an existing RFP", async () => {
    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue({
      id: "rfp1",
      private: true,
      endDate: null,
      title: "Old Title",
    } as any)

    ;(prisma.rFP.upsert as jest.Mock).mockResolvedValue({
      id: "rfp1",
      title: "Updated Title",
      private: true,
      startDate: null,
      endDate: null,
      organization: { name: "Test Org" },
    } as any)

    const result = await createOrUpdateRFP(
      organization,
      { id: "rfp1", title: "Updated Title" },
      actor
    )

    expect(prisma.rFP.upsert).toHaveBeenCalled()
    expect(result.title).toBe("Updated Title")
  })

  it("emits publish event when private → public", async () => {
    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue({
      id: "rfp1",
      private: true,
      endDate: null,
      title: "Test",
    } as any)

    ;(prisma.rFP.upsert as jest.Mock).mockResolvedValue({
      id: "rfp1",
      title: "Test",
      private: false,
      startDate: null,
      endDate: null,
      organization: { name: "Test Org" },
    } as any)

    await createOrUpdateRFP(
      organization,
      { id: "rfp1", private: false },
      actor
    )

    expect(writeRawEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "org_created_rfp",
      })
    )

    expect(customerIOTrack).toHaveBeenCalled()
  })

  it("emits rfp_closed when end date is in the past", async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60)

    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue({
      id: "rfp1",
      private: false,
      endDate: null,
      title: "Test",
    } as any)

    ;(prisma.rFP.upsert as jest.Mock).mockResolvedValue({
      id: "rfp1",
      title: "Test",
      private: false,
      startDate: null,
      endDate: pastDate,
      organization: { name: "Test Org" },
    } as any)

    await createOrUpdateRFP(
      organization,
      { id: "rfp1", endDate: pastDate },
      actor
    )

    expect(writeRawEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "rfp_closed",
      })
    )
  })

  it("throws when prisma fails", async () => {
    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.rFP.upsert as jest.Mock).mockRejectedValue(new Error("DB failure"))

    await expect(
      createOrUpdateRFP(organization, { id: "1234", title: "Test" })
    ).rejects.toThrow("DB failure")
  })
})

describe("createRoadmap", () => {
  const organization = {
    id: "org1",
    name: "Test Org",
    subdomain: "test",
    image: "logo.png",
  } as any

  const actor = {
    userId: "user1",
    userName: "Test User",
  }

  beforeEach(() => {
    jest.clearAllMocks()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: {
        id: "user1",
        name: "Test User",
      },
    })
  })

  it("throws if organization id is missing", async () => {
    await expect(createRoadmap({} as any)).rejects.toThrow(
      "No organization id provided."
    )
  })

  it("creates a roadmap without a template", async () => {
    const mockRoadmap = { id: "roadmap1" }

    ;(prisma.roadmap.create as jest.Mock).mockResolvedValue(mockRoadmap as any)

    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue({
      id: "roadmap1",
      title: "Test Roadmap",
      milestones: [],
      nodes: [],
      edges: [],
      organization: { name: "Test Org", members: [] },
    } as any)

    const result = await createRoadmap(organization, undefined, actor)

    expect(prisma.roadmap.create).toHaveBeenCalled()

    expect(writeRawEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "org_research_plan_created",
        externalId: "roadmap1",
      })
    )

    expect(customerIOTrack).toHaveBeenCalled()

    expect(revalidatePath).toHaveBeenCalledWith(
      "/app/marketplace/service-providers"
    )

    expect(result?.id).toBe("roadmap1")
  })

  it("creates nodes and edges when template has milestones", async () => {
    const template = {
      title: "Template Roadmap",
      milestones: [{ id: "m1", nodeId: "n1" }],
      nodes: [{ id: "n1", positionX: 100 }],
    } as any

    const mockRoadmap = { id: "roadmap1" }

    ;(prisma.roadmap.create as jest.Mock).mockResolvedValue(mockRoadmap as any)

    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue({
      id: "roadmap1",
      title: "Template Roadmap",
      milestones: [],
      nodes: [],
      edges: [],
      organization: { name: "Test Org", members: [] },
    } as any)

    const createNodesSpy = jest.spyOn(
      require("./actions"),
      "createNodesAndEdgesFromTemplate"
    ).mockResolvedValue(undefined)

    await createRoadmap(organization, template, actor)

    expect(createNodesSpy).toHaveBeenCalled()
  })

  it("still succeeds if customerIO tracking fails", async () => {
    ;(prisma.roadmap.create as jest.Mock).mockResolvedValue({ id: "roadmap1" } as any)

    ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue({
      id: "roadmap1",
      title: "Test",
      milestones: [],
      nodes: [],
      edges: [],
      organization: { name: "Test Org", members: [] },
    } as any)

    ;(customerIOTrack as jest.Mock).mockRejectedValue(new Error("CIO failed"))

    const result = await createRoadmap(organization, undefined, actor)

    expect(result.id).toBe("roadmap1")
  })

  it("throws when prisma create fails", async () => {
    ;(prisma.roadmap.create as jest.Mock).mockRejectedValue(new Error("DB error"))

    await expect(createRoadmap(organization)).rejects.toThrow("DB error")
  })
})

// describe("createNodesAndEdgesFromTemplate", () => {
//   const organization = { id: "org1" } as any
//   const roadmapId = "roadmap-1"

//   beforeEach(() => {
//     jest.clearAllMocks()
//   })

//   it("creates nodes and edges from a template", async () => {
//     ;(prisma.milestone.count as jest.Mock).mockResolvedValue(0)

//     ;(prisma.node.create as jest.Mock)
//       .mockResolvedValueOnce({ id: "node1" } as any)
//       .mockResolvedValueOnce({ id: "node2" } as any)

//     ;(prisma.edge.create as jest.Mock).mockResolvedValue({ id: "edge1" } as any)

//     const finalRoadmap = {
//       id: roadmapId,
//       milestones: [],
//       nodes: [{ id: "node1" }, { id: "node2" }],
//       edges: [{ id: "edge1" }],
//       organization: { id: organization.id, members: [] },
//     }
//     ;(prisma.roadmap.findUnique as jest.Mock).mockResolvedValue(finalRoadmap as any)

//     const template = {
//       nodes: [
//         { id: "t1", positionX: 0, positionY: 0 },
//         { id: "t2", positionX: 500, positionY: 0 },
//       ],
//       milestones: [
//         {
//           nodeId: "t1",
//           title: "Milestone 1",
//           status: "PLANNED",
//           types: [],
//         },
//         {
//           nodeId: "t2",
//           title: "Milestone 2",
//           status: "PLANNED",
//           types: [],
//         },
//       ],
//       edges: [
//         { source: "t1", target: "t2" },
//       ],
//       metadata: {},
//     } as any

//     const result = await createNodesAndEdgesFromTemplate(
//       organization,
//       roadmapId,
//       template
//     )

//     expect(result).toEqual({
//       success: true,
//       data: finalRoadmap,
//     })
//   })
// })

describe("moveNodes", () => {
  const organization = { id: "org1" } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates node positions successfully", async () => {
    const nodes = [
      { id: "node1", position: { x: 100, y: 200 } },
      { id: "node2", position: { x: 300, y: 400 } },
    ]

    // Mock $transaction to call the function directly
    ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) =>
      fn(prisma)
    )

    // Mock node.update
    ;(prisma.node.update as jest.Mock)
      .mockResolvedValueOnce({ id: "node1", positionX: 100, positionY: 200 })
      .mockResolvedValueOnce({ id: "node2", positionX: 300, positionY: 400 })

    const result = await moveNodes(organization, nodes)

    expect(result).toEqual({
      success: true,
      data: [
        { id: "node1", positionX: 100, positionY: 200 },
        { id: "node2", positionX: 300, positionY: 400 },
      ],
    })

    expect(prisma.node.update).toHaveBeenCalledTimes(2)
    expect(prisma.node.update).toHaveBeenCalledWith({
      where: { id: "node1" },
      data: { positionX: 100, positionY: 200 },
    })
    expect(prisma.node.update).toHaveBeenCalledWith({
      where: { id: "node2" },
      data: { positionX: 300, positionY: 400 },
    })
  })

  it("skips nodes that do not exist (P2025)", async () => {
    const nodes = [{ id: "missingNode", position: { x: 0, y: 0 } }]

    ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) =>
      fn(prisma)
    )

    ;(prisma.node.update as jest.Mock).mockImplementation(async () => {
      const e: any = new Error("Record not found")
      e.code = "P2025"
      throw e
    })

    const result = await moveNodes(organization, nodes)

    expect(result).toEqual({
      success: true,
      data: [], // skipped node
    })
  })

  it("returns an error if unexpected exception occurs", async () => {
    const nodes = [{ id: "node1", position: { x: 0, y: 0 } }]

    ;(prisma.$transaction as jest.Mock).mockImplementation(async () => {
      throw new Error("Database down")
    })

    const result = await moveNodes(organization, nodes)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("updateDBFlow", () => {
  const organization = { id: "org1" } as any
  const roadmapId = "roadmap-1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates nodes, edges, and milestones correctly", async () => {
    const nodes = [
      { id: "node1", position: { x: 100, y: 200 }, data: { title: "M1", attachments: [] } },
      { id: "node2", positionX: 300, positionY: 400, data: { title: "M2", attachments: [] } },
      { id: "node3", position: { x: 500, y: 600 } }, // no milestone
    ]
    const edges = [
      { id: "edge1", source: "node1", target: "node2" },
      { id: "edge2", source: "node2", target: "node3" },
    ]

    // Mock findMany to simulate existing DB data
    ;(prisma.node.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: "node1" }, { id: "node2" }]) // existing nodes
      .mockResolvedValueOnce(nodes) // final nodes
    ;(prisma.edge.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: "edge1" }]) // existing edges
      .mockResolvedValueOnce(edges) // final edges
    ;(prisma.milestone.findMany as jest.Mock).mockResolvedValue([
      { id: "ms1", nodeId: "node1" },
      { id: "ms2", nodeId: "node2" },
    ])

    // Mock $transaction to call the callback immediately with prisma
    ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => fn(prisma))

    ;(prisma.node.deleteMany as jest.Mock).mockResolvedValue({})
    ;(prisma.edge.deleteMany as jest.Mock).mockResolvedValue({})
    ;(prisma.node.createMany as jest.Mock).mockResolvedValue({})
    ;(prisma.node.update as jest.Mock).mockResolvedValue({})
    ;(prisma.edge.createMany as jest.Mock).mockResolvedValue({})
    ;(prisma.edge.update as jest.Mock).mockResolvedValue({})
    ;(prisma.milestone.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.milestone.create as jest.Mock).mockResolvedValue({})
    ;(prisma.milestone.update as jest.Mock).mockResolvedValue({})

    const result = await updateDBFlow(organization, { roadmapId, nodes, edges })

    expect(result).toEqual({
      success: true,
      data: {
        nodes,
        edges,
        milestones: [
          { id: "ms1", nodeId: "node1" },
          { id: "ms2", nodeId: "node2" },
        ],
      },
    })

    // Check createMany for nodes/edges
    expect(prisma.node.createMany).toHaveBeenCalled()
    expect(prisma.edge.createMany).toHaveBeenCalled()

    // Ensure milestones were created
    expect(prisma.milestone.create).toHaveBeenCalledTimes(2)
  })

  it("returns error if roadmapId is missing", async () => {
    const result = await updateDBFlow(organization, { roadmapId: null, nodes: [], edges: [] })
    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("createMilestones", () => {
  const roadmapId = "roadmap-1"
  const milestones = [
    {
      id: "ms1",
      title: "Milestone 1",
      types: [{ milestoneTypeId: "type1" }],
      tools: [{ toolId: "tool1" }],
      rfps: [{ rfpId: "rfp1" }],
      timelineOrder: 1,
      description: "Test milestone",
      startDate: new Date(),
      endDate: new Date(),
      budget: 1000,
      attachments: [{ link: "link1" }],
      contacts: [{ email: "a@test.com", name: "Alice" }],
      companies: [{ companyId: "c1" }],
      institutions: [{ institutionId: "i1" }],
      status: "PLANNED",
      private: true,
      nodeType: "PROJECT",
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates milestones successfully", async () => {
    // Mock organization lookup
    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue([
      { id: "org1", roadmaps: [{ id: roadmapId }] },
    ])

    // Mock milestone creation
    ;(prisma.milestone.create as jest.Mock).mockImplementation((data: any) =>
      Promise.resolve({ ...data.data, id: data.data.id })
    )

    const result = await createMilestones({ id: "org1" } as any, {
      roadmapId,
      milestones,
    })

    expect(result.success).toBe(true)
    expect(result.data.milestones).toHaveLength(1)
    expect(result.data.milestones[0].title).toBe("Milestone 1")

    // Check that prisma.milestone.create was called with correct nested data
    expect(prisma.milestone.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "ms1",
          title: "Milestone 1",
          roadmap: { connect: { id: roadmapId } },
          organization: { connect: { id: "org1" } },
          types: { create: [{ milestoneType: { connect: { id: "type1" } } }] },
          tools: { create: [{ tool: { connect: { id: "tool1" } } }] },
          rfps: { create: [{ rfp: { connect: { id: "rfp1" } } }] },
        }),
      })
    )
  })

  it("returns error if roadmapId is missing", async () => {
    const result = await createMilestones({ id: "org1" } as any, {
      roadmapId: null,
      milestones,
    })

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })

  it("returns error if organization cannot be found", async () => {
    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue([])

    const result = await createMilestones({ id: "org1" } as any, {
      roadmapId,
      milestones,
    })

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("createNodes", () => {
  const roadmapId = "roadmap-1"
  const session = { user: { id: "user1", name: "Alice" } }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(session)
  })

  it("creates nodes and milestones successfully", async () => {
    const nodes = [
      {
        id: "node1",
        position: { x: 0, y: 0 },
        origin: "template",
        data: {
          id: "ms1",
          title: "Milestone 1",
          types: [{ milestoneTypeId: "type1" }],
          timelineOrder: 0,
          description: "Test milestone",
          private: false,
          nodeType: "PROJECT",
          attachments: [{ link: "link1" }],
          contacts: [{ email: "a@test.com", name: "Alice" }],
        },
      },
    ]

    // Mock org lookup
    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue([
      { id: "org1", name: "OrgName", subdomain: "org", image: "img.png", roadmaps: [{ id: roadmapId }] },
    ])

    // Mock node creation
    ;(prisma.node.create as jest.Mock).mockImplementation(async (data: any) => ({
      ...data.data,
      data: data.data.data.create,
    }))

    // Mock milestones returned from prisma
    ;(prisma.milestone.findMany as jest.Mock).mockResolvedValue([
      { nodeId: "node1", title: "Milestone 1" },
    ])

    const result = await createNodes({ id: "org1" } as any, { roadmapId, nodes })

    expect(result.success).toBe(true)
    expect(result.data.nodes).toHaveLength(1)
    expect(result.data.milestones).toHaveLength(1)
    expect(prisma.node.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: "node1", positionX: 0, positionY: 0 }),
      })
    )
  })

  it("returns error if roadmapId is missing", async () => {
    const result = await createNodes({ id: "org1" } as any, { roadmapId: null, nodes: [] })
    expect(result).toEqual({ success: false, error: "Internal server error" })
  })

  it("returns error if organization cannot be found", async () => {
    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue([])
    const result = await createNodes({ id: "org1" } as any, { roadmapId, nodes: [] })
    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

describe("deleteNode", () => {
  const nodeId = "node-1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully deletes a node", async () => {
    const mockDeletedNode = { id: nodeId, data: { id: "milestone-1", title: "Test Milestone" } }
    ;(prisma.node.delete as jest.Mock).mockResolvedValue(mockDeletedNode)

    const result = await deleteNode({ id: "org1" } as any, nodeId)

    expect(prisma.node.delete).toHaveBeenCalledWith({
      where: { id: nodeId },
      include: { data: true },
    })

    expect(result).toEqual({ success: true, data: mockDeletedNode })
  })

  it("returns error if no nodeId is provided", async () => {
    const result = await deleteNode({ id: "org1" } as any, undefined)
    expect(result).toEqual({ success: false, error: "No nodeId provided" })
  })

  it("returns error if deletion fails or deleted node is invalid", async () => {
    ;(prisma.node.delete as jest.Mock).mockResolvedValue({ id: nodeId, data: null })

    const result = await deleteNode({ id: "org1" } as any, nodeId)

    expect(result).toEqual({ success: false, error: "failed to delete node" })
  })

  it("returns error if Prisma throws an exception", async () => {
    ;(prisma.node.delete as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await deleteNode({ id: "org1" } as any, nodeId)

    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

describe("updateEdges", () => {
  const roadmapId = "roadmap-1"
  const edges = [
    { id: "edge1", source: "node1", target: "node2" },
    { id: "edge2", source: "node2", target: "node3" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully deletes old edges and upserts new edges", async () => {
    ;(prisma.edge.deleteMany as jest.Mock).mockResolvedValue({ count: 2 })

    // Mock upsert individually for each edge
    ;(prisma.edge.upsert as jest.Mock)
      .mockResolvedValueOnce(edges[0])
      .mockResolvedValueOnce(edges[1])

    ;(prisma.edge.findMany as jest.Mock).mockResolvedValue(edges)

    const result = await updateEdges({ id: "org1" } as any, { roadmapId, edges })

    expect(prisma.edge.deleteMany).toHaveBeenCalledWith({ where: { roadmapId } })

    expect(prisma.edge.upsert).toHaveBeenCalledTimes(edges.length)
    expect(prisma.edge.upsert).toHaveBeenCalledWith({
      where: { id: "edge1" },
      update: { source: "node1", target: "node2" },
      create: { id: "edge1", roadmap: { connect: { id: roadmapId } }, source: "node1", target: "node2" },
    })
    expect(prisma.edge.upsert).toHaveBeenCalledWith({
      where: { id: "edge2" },
      update: { source: "node2", target: "node3" },
      create: { id: "edge2", roadmap: { connect: { id: roadmapId } }, source: "node2", target: "node3" },
    })

    expect(prisma.edge.findMany).toHaveBeenCalledWith({ where: { roadmapId } })
    expect(result).toEqual({ success: true, data: edges })
  })

  it("returns internal server error if Prisma throws", async () => {
    ;(prisma.edge.deleteMany as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await updateEdges({ id: "org1" } as any, { roadmapId, edges })
    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

// describe("syncDBRFPs", () => {
//   const mockSession = {
//     user: { organizationId: "org1", id: "user1" }
//   }

//   const rfps = [
//     { id: "rfp1", title: "RFP 1" },
//     { id: "rfp2", title: "RFP 2" },
//   ]

//   beforeEach(() => {
//     jest.clearAllMocks()
//     ;(getSession as jest.Mock).mockResolvedValue(mockSession)
//   })

//   it("updates existing RFPs and creates new ones if missing", async () => {
//     // rfp1 exists, rfp2 does not
//     ;(prisma.rFP.findUnique as jest.Mock)
//       .mockImplementation(({ where: { id } }) => {
//         if (id === "rfp1") return Promise.resolve({ id: "rfp1", title: "Existing RFP 1" })
//         return Promise.resolve(null)
//       })

//     // ;(createOrUpdateRFP as jest.Mock).mockResolvedValue({ id: "rfp2", title: "Created RFP 2" })

//     const result = await syncDBRFPs({ id: "org1" } as any, { rfps })

//     expect(prisma.rFP.findUnique).toHaveBeenCalledTimes(2)
//     expect(result).toEqual({
//       success: true,
//       data: [
//         { id: "rfp1", title: "Existing RFP 1" },
//         { id: "rfp2", title: "Created RFP 2" },
//       ]
//     })
//   })

//   it("handles errors gracefully", async () => {
//     ;(prisma.rFP.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

//     const result = await syncDBRFPs({ id: "org1" } as any, { rfps })

//     expect(result.success).toBe(false)
//     expect(result.error).toBeInstanceOf(Error)
//     expect(result.error.message).toBe("DB error")
//   })
// })

describe("updateMilestonesVisibility", () => {
  const roadmapId = "roadmap1"
  const milestones = [
    { id: "m1", roadmapId, private: true },
    { id: "m2", roadmapId, private: true },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates milestones and updates roadmap publish status", async () => {
    ;(prisma.milestone.updateMany as jest.Mock).mockResolvedValue({ count: milestones.length })
    ;(prisma.milestone.findMany as jest.Mock).mockResolvedValue([
      { id: "m1", private: false },
      { id: "m2", private: false },
    ])
    ;(prisma.roadmap.update as jest.Mock).mockResolvedValue({ id: roadmapId, private: false })

    const result = await updateMilestonesVisibility({ id: "org1" } as any, { milestones, isPrivate: false })

    expect(prisma.milestone.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["m1", "m2"] } },
      data: { private: false },
    })

    expect(prisma.milestone.findMany).toHaveBeenCalledWith({ where: { roadmapId } })
    expect(prisma.roadmap.update).toHaveBeenCalledWith({
      where: { id: roadmapId },
      data: { private: false },
    })

    expect(result).toEqual({ success: true, data: { count: 2 } })
  })

  it("handles errors gracefully", async () => {
    ;(prisma.milestone.updateMany as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await updateMilestonesVisibility({ id: "org1" } as any, { milestones, isPrivate: false })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
  })
})

describe("updateMilestones", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1", name: "Test User" },
    })
  })

  it("updates milestones and returns them", async () => {
    const milestone = {
      id: "m1",
      nodeId: "n1",
      title: "Updated Milestone",
      private: false,
      types: [],
      biosamples: [],
      diseaseModels: [],
      tools: [],
      rfps: [],
      institutions: [],
      companies: [],
      attachments: [],
      contacts: [],
      roadmapId: "roadmap-1",
    }

    // Mock existing milestone in DB
    ;(prisma.milestone.findUnique as jest.Mock).mockResolvedValue({
      id: "m1",
      private: true,
      types: [],
      biosamples: [],
      diseaseModels: [],
      tools: [],
      rfps: [],
      institutions: [],
      companies: [],
      attachments: [],
      contacts: [],
    })

    ;(prisma.milestone.update as jest.Mock).mockResolvedValue({
      ...milestone,
      updatedAt: new Date().toISOString(),
      nodeType: "PROJECT",
      organizationId: "org1",
    })

    ;(prisma.milestone.findMany as jest.Mock).mockResolvedValue([
      { ...milestone, private: false },
    ])

    ;(prisma.roadmap.update as jest.Mock).mockResolvedValue({
      id: "roadmap-1",
      private: false,
    })

    const result = await updateMilestones({} as any, { milestones: [milestone] })

    expect(result.success).toBe(true)
    expect(result.data.length).toBe(1)
    expect(result.data[0].id).toBe("m1")

    // Should call writeRawEvent for public milestone
    expect(writeRawEvent).toHaveBeenCalled()
  })

  it("returns error if something fails", async () => {
    ;(prisma.milestone.findUnique as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const milestone = { id: "m1", nodeId: "n1", roadmapId: "roadmap-1" }

    const result = await updateMilestones({} as any, { milestones: [milestone] })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
  })
})

describe("notificationsViewed", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully updates notifications", async () => {
    const notifications = [
      { id: "notif1", message: "Test 1" },
      { id: "notif2", message: "Test 2" },
    ]

    // Mock prisma update to return the notification with lastViewedAt
    ;(prisma.platformNotification.update as jest.Mock).mockImplementation(
      ({ where }) => ({
        id: where.id,
        lastViewedAt: new Date(),
      })
    )

    const result = await notificationsViewed({ notifications })

    expect(result.success).toBe(true)
    expect(result.data.length).toBe(2)
    expect(result.data[0].id).toBe("notif1")
    expect(result.data[1].id).toBe("notif2")
    expect(prisma.platformNotification.update).toHaveBeenCalledTimes(2)
  })

  it("skips undefined notifications", async () => {
    const notifications = [
      { id: "notif1", message: "Test 1" },
      undefined,
    ]

    ;(prisma.platformNotification.update as jest.Mock).mockImplementation(
      ({ where }) => ({ id: where.id, lastViewedAt: new Date() })
    )

    const result = await notificationsViewed({ notifications })

    expect(result.success).toBe(true)
    expect(result.data.length).toBe(1)
    expect(result.data[0].id).toBe("notif1")
    expect(prisma.platformNotification.update).toHaveBeenCalledTimes(1)
  })

  it("returns error if prisma update throws", async () => {
    const notifications = [{ id: "notif1", message: "Test 1" }]

    ;(prisma.platformNotification.update as jest.Mock).mockRejectedValue(
      new Error("DB failure")
    )

    const result = await notificationsViewed({ notifications })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
  })
})

describe("createNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully creates a notification", async () => {
    const mockSession = {
      user: { id: "user1", organizationId: "org1" },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const notificationData = { title: "Test Notification", message: "Hello" }
    const createdNotification = { id: "notif1", ...notificationData }

    ;(prisma.platformNotification.create as jest.Mock).mockResolvedValue(
      createdNotification
    )

    const result = await createNotification({ notificationData })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(createdNotification)
    expect(prisma.platformNotification.create).toHaveBeenCalledWith({
      data: {
        ...notificationData,
        user: { connect: { id: "user1" } },
        organization: { connect: { id: "org1" } },
      },
    })
  })

  it("returns an error if session is missing", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    const notificationData = { title: "Test" }

    const result = await createNotification({ notificationData })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
    expect(prisma.platformNotification.create).not.toHaveBeenCalled()
  })

  it("returns an error if prisma.create throws", async () => {
    const mockSession = {
      user: { id: "user1", organizationId: "org1" },
    }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    const notificationData = { title: "Test" }

    ;(prisma.platformNotification.create as jest.Mock).mockRejectedValue(
      new Error("DB failure")
    )

    const result = await createNotification({ notificationData })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
  })
})

describe("createNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully creates notifications and fetches them", async () => {
    const mockSession = { user: { id: "user1", organizationId: "org1" } }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)

    const notificationsList = [
      { title: "Notif 1", message: "Hello" },
      { title: "Notif 2", message: "World" },
    ]

    const createdNotifications = [
      { id: "n1", ...notificationsList[0], userId: "user1", organizationId: "org1" },
      { id: "n2", ...notificationsList[1], userId: "user1", organizationId: "org1" },
    ];

    ;(prisma.platformNotification.createMany as jest.Mock).mockResolvedValue({ count: 2 })
    ;(prisma.platformNotification.findMany as jest.Mock).mockResolvedValue(createdNotifications)

    const result = await createNotifications({ notificationsList })

    expect(result.success).toBe(true)
    expect(result.data).toEqual(createdNotifications)
    expect(prisma.platformNotification.createMany).toHaveBeenCalledWith({
      data: notificationsList.map(notification => ({
        ...notification,
        userId: "user1",
        organizationId: "org1",
      })),
    })
    expect(prisma.platformNotification.findMany).toHaveBeenCalledWith({
      where: { userId: "user1", organizationId: "org1" },
    })
  })

  it("returns error if session is missing", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    const notificationsList = [{ title: "Test" }]

    const result = await createNotifications({ notificationsList })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
    expect(prisma.platformNotification.createMany).not.toHaveBeenCalled()
  })

  it("returns error if prisma.createMany fails", async () => {
    const mockSession = { user: { id: "user1", organizationId: "org1" } }
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    const notificationsList = [{ title: "Test" }];

    ;(prisma.platformNotification.createMany as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await createNotifications({ notificationsList })

    expect(result.success).toBe(false)
    expect(result.error).toBe("Internal server error")
  })
})

describe("createReview", () => {
  const companyId = "company1"
  const mockFormData = new Map([
    ["title", "Great Company"],
    ["body", "Excellent service"],
    ["rating", "5"]
  ]) as unknown as FormData

  const mockSession = { user: { id: "user1", organizationId: "org1", name: "Test User" } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("throws error if no session", async () => {
    (getSession as jest.Mock).mockResolvedValue(null)
    await expect(createReview(companyId, mockFormData as any)).rejects.toThrow("You must be signed in to perform this action")
  })

  it("returns error if review already exists", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: "review1" })

    const result = await createReview(companyId, mockFormData as any)
    expect(result).toEqual({ success: false, error: "You have already created a review for this company." })
  })

  it("successfully creates a review and updates company avgRating", async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue(null)

    const createdReview = { id: "review1", title: "Great Company", rating: 5 }
    const updatedCompany = { id: companyId, avgRating: 5 };

    // Mock $transaction to run the inner callback with a tx object
    ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      return fn({
        review: {
          create: jest.fn().mockResolvedValue(createdReview),
          aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 } })
        },
        company: {
          update: jest.fn().mockResolvedValue(updatedCompany)
        }
      })
    })

    const result = await createReview(companyId, mockFormData as any)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(createdReview)
    expect(updateTypeSenseDocument).toHaveBeenCalledWith(
      expect.stringContaining("https://"),
      expect.any(String),
      updatedCompany,
      'companies'
    )
    expect(revalidatePath).toHaveBeenCalledWith(`/app/service-providers/${companyId}`)
  })

  it("returns error if transaction throws", async () => {
    (getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await createReview(companyId, mockFormData as any)
    expect(result.success).toBe(false)
    expect(result.error).toBe("Database error. Please try again later.")
  })
})

describe("editReview", () => {
  const companyId = "company1"
  const mockFormData = new Map([
    ["title", "Updated Title"],
    ["body", "Updated Body"],
    ["rating", "4"],
    ["milestone", "milestone1"]
  ]) as unknown as FormData

  const mockSession = { user: { id: "user1", organizationId: "org1", name: "Test User" } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("throws error if no session", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)
    await expect(editReview(companyId, mockFormData as any)).rejects.toThrow("You must be signed in to perform this action")
  })

  it("returns error if no existing review", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await editReview(companyId, mockFormData as any)
    expect(result).toEqual({ success: false, error: "No existing review found to update." })
  })

  it("returns error if session user is not the author", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: "review1", authorId: "otherUser" })

    const result = await editReview(companyId, mockFormData as any)
    expect(result).toEqual({
      success: false,
      error: "Not authorized: only the user who created this review can edit it."
    })
  })

  it("successfully updates review and company avgRating", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    const existingReview = { id: "review1", authorId: mockSession.user.id }
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue(existingReview)

    const updatedReview = { id: "review1", title: "Updated Title", rating: 4 }
    const updatedCompany = { id: companyId, avgRating: 4 }

    ;(prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      return fn({
        review: {
          update: jest.fn().mockResolvedValue(updatedReview),
          aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 4 } })
        },
        company: {
          update: jest.fn().mockResolvedValue(updatedCompany)
        }
      })
    })

    const result = await editReview(companyId, mockFormData as any)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(updatedReview)
    expect(updateTypeSenseDocument).toHaveBeenCalledWith(
      expect.stringContaining("https://"),
      expect.any(String),
      updatedCompany,
      'companies'
    )
    expect(revalidatePath).toHaveBeenCalledWith(`/app/service-providers/${companyId}`)
  })

  it("returns error if transaction fails", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: "review1", authorId: mockSession.user.id })
    ;(prisma.$transaction as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await editReview(companyId, mockFormData as any)
    expect(result.success).toBe(false)
    expect(result.error).toBe("Database error. Please try again later.")
  })
})

describe("deleteReview", () => {
  const mockReview = { id: "review1", authorId: "user1", title: "Test Review" }
  const mockSession = { user: { id: "user1", organizationId: "org1" } }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns success when the author deletes their review", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.delete as jest.Mock).mockResolvedValue(mockReview)

    const result = await deleteReview({ id: "org1" } as any, mockReview as any)
    expect(result).toEqual({ success: true, data: mockReview })
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: mockReview.id } })
  })

  it("returns error if session user is not the author", async () => {
    ;(getSession as jest.Mock).mockResolvedValue({ user: { id: "otherUser", organizationId: "org1" } })
    ;(prisma.review.delete as jest.Mock).mockResolvedValue(mockReview)

    const result = await deleteReview({ id: "org1" } as any, mockReview as any)
    expect(result).toEqual({
      success: false,
      error: "Not authorized: only the user who created this review can delete it."
    })
  })

  it("returns error if prisma.delete fails", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
    ;(prisma.review.delete as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await deleteReview({ id: "org1" } as any, mockReview as any)
    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later."
    })
  })
})

describe("saveCRO", () => {
  const mockOrganization = { id: "org1" } as any
  const mockCRO = { id: "cro1", name: "Test CRO" }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully saves a CRO when not already saved", async () => {
    ;(prisma.savedCompany.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedCompany.create as jest.Mock).mockResolvedValue({
      id: "saved1",
      companyId: "cro1",
      organizationId: "org1",
      company: mockCRO,
    })

    const result = await saveCRO(mockOrganization, "cro1")

    expect(result).toEqual({
      success: true,
      data: {
        id: "saved1",
        companyId: "cro1",
        organizationId: "org1",
        company: mockCRO,
      },
    })
    expect(prisma.savedCompany.findFirst).toHaveBeenCalledWith({
      where: { companyId: "cro1", organizationId: "org1" },
    })
    expect(prisma.savedCompany.create).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledTimes(3)
  })

  it("returns error if CRO is already saved", async () => {
    ;(prisma.savedCompany.findFirst as jest.Mock).mockResolvedValue({ id: "saved1" })

    const result = await saveCRO(mockOrganization, "cro1")
    expect(result).toEqual({
      success: false,
      error: "This CRO is already saved. To remove it, go to your saved page and unsave it there.",
    })
    expect(prisma.savedCompany.create).not.toHaveBeenCalled()
  })

  it("returns error on database failure", async () => {
    ;(prisma.savedCompany.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedCompany.create as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await saveCRO(mockOrganization, "cro1")
    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })

  it("handles unique constraint error (P2002)", async () => {
    ;(prisma.savedCompany.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedCompany.create as jest.Mock).mockRejectedValue({ code: "P2002" })

    const result = await saveCRO(mockOrganization, "cro1")
    expect(result).toEqual({
      success: false,
      error: "This CRO is already saved. To remove it, go to your saved page and unsave it there.",
    })
  })
})

describe("contactCRO", () => {
  const mockOrganization = { id: "org1" } as any
  const mockCROId = "cro1"
  const mockSession = {
    user: { id: "user1", name: "Test User", email: "test@example.com" },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSession as jest.Mock).mockResolvedValue(mockSession)
  })

  it("successfully creates a contact request and sends email", async () => {
    const formData = new FormData()
    formData.set("description", "Looking for services")
    formData.set("timeline", "Next month")
    formData.set("services", "service1,service2")
    formData.set("rfps", "rfp1,rfp2")

    const mockResponse = {
      id: "request1",
      company: { id: mockCROId, title: "Test CRO" },
      organization: { id: "org1", name: "Test Org", image: "org.png" },
      description: "Looking for services",
      timeline: "Next month",
      services: [],
      rfps: [],
    }

    ;(prisma.companyContactRequest.create as jest.Mock).mockResolvedValue(mockResponse)

    const result = await contactCRO(mockOrganization, mockCROId, formData)

    expect(result).toEqual({ success: true, data: mockResponse })
    expect(prisma.companyContactRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          company: { connect: { id: mockCROId } },
          organization: { connect: { id: "org1" } },
          description: "Looking for services",
          timeline: "Next month",
          services: { create: [{ service: { connect: { id: "service1" } } }, { service: { connect: { id: "service2" } } }] },
          rfps: { create: [{ rfp: { connect: { id: "rfp1" } } }, { rfp: { connect: { id: "rfp2" } } }] },
        }),
        include: { company: true, organization: true, services: true, rfps: true },
      })
    )
    expect(sendProviderContactRequestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        userName: "Test User",
        email: "test@example.com",
        providerName: "Test CRO",
        organizationName: "Test Org",
        organizationImage: "org.png",
      })
    )
  })

  it("returns error if database fails", async () => {
    const formData = new FormData()
    formData.set("description", "Looking for services")
    formData.set("timeline", "Next month")

    ;(prisma.companyContactRequest.create as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await contactCRO(mockOrganization, mockCROId, formData)

    expect(result).toEqual({ success: false, error: "Database error. please try again later." })
    expect(sendProviderContactRequestEmail).not.toHaveBeenCalled()
  })
})

describe("saveOrganization", () => {
  const mockOrg = { id: "org1" } as any
  const mockSavedOrgId = "org2"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully saves an organization", async () => {
    const mockResponse = {
      id: "saved1",
      organization: { id: "org1", name: "Org 1" },
      savedOrganization: { id: "org2", name: "Org 2" },
    }

    ;(prisma.savedOrganization.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedOrganization.create as jest.Mock).mockResolvedValue(mockResponse)

    const result = await saveOrganization(mockOrg, mockSavedOrgId)

    expect(result).toEqual({ success: true, data: mockResponse })
    expect(prisma.savedOrganization.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: mockOrg.id, savedOrganizationId: mockSavedOrgId },
      })
    )
    expect(prisma.savedOrganization.create).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { savedOrganization: true, organization: true },
        data: {
          savedOrganization: { connect: { id: mockSavedOrgId } },
          organization: { connect: { id: mockOrg.id } },
        },
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith("/app/marketplace")
    expect(revalidatePath).toHaveBeenCalledWith("/app/marketplace/patient-groups")
  })

  it("returns error if organization is already saved", async () => {
    ;(prisma.savedOrganization.findFirst as jest.Mock).mockResolvedValue({ id: "saved1" })

    const result = await saveOrganization(mockOrg, mockSavedOrgId)

    expect(result).toEqual({
      success: false,
      error: "This organization is already saved. To remove it, go to your saved page and unsave it there.",
    })
    expect(prisma.savedOrganization.create).not.toHaveBeenCalled()
  })

  it("handles database errors gracefully", async () => {
    ;(prisma.savedOrganization.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedOrganization.create as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await saveOrganization(mockOrg, mockSavedOrgId)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })

  it("handles unique constraint error code P2002", async () => {
    ;(prisma.savedOrganization.findFirst as jest.Mock).mockResolvedValue(null)
    ;(prisma.savedOrganization.create as jest.Mock).mockRejectedValue({ code: "P2002" })

    const result = await saveOrganization(mockOrg, mockSavedOrgId)

    expect(result).toEqual({
      success: false,
      error: "This organization is already saved. To remove it, go to your saved page and unsave it there.",
    })
  })
})

describe("editSavedCRO", () => {
  const savedCROId = "savedCRO1"
  const milestoneId = "milestone1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully edits a saved CRO", async () => {
    const mockResponse = {
      id: savedCROId,
      company: { id: "cro1", title: "CRO 1" },
      milestone: { id: milestoneId, types: [] },
    }

    ;(prisma.savedCompany.update as jest.Mock).mockResolvedValue(mockResponse)

    const result = await editSavedCRO({ id: "org1" } as any, savedCROId, milestoneId)

    expect(result).toEqual({ success: true, data: mockResponse })
    expect(prisma.savedCompany.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: savedCROId },
        include: { company: true, milestone: { include: { types: true } } },
        data: { milestone: { connect: { id: milestoneId } } },
      })
    )
  })

  it("returns error if update returns null", async () => {
    ;(prisma.savedCompany.update as jest.Mock).mockResolvedValue(null)

    const result = await editSavedCRO({ id: "org1" } as any, savedCROId, milestoneId)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })

  it("handles database errors", async () => {
    ;(prisma.savedCompany.update as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await editSavedCRO({ id: "org1" } as any, savedCROId, milestoneId)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })
})

describe("unsaveCRO", () => {
  const savedCompanyId = "savedCompany1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully unsaves a CRO", async () => {
    const mockResponse = {
      id: savedCompanyId,
      company: { id: "cro1", title: "CRO 1" },
      milestone: { id: "milestone1", types: [] },
    }

    ;(prisma.savedCompany.delete as jest.Mock).mockResolvedValue(mockResponse)

    const result = await unsaveCRO({ id: "org1" } as any, savedCompanyId)

    expect(result).toEqual({ success: true, data: mockResponse })
    expect(prisma.savedCompany.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: savedCompanyId },
        include: { company: true, milestone: { include: { types: true } } },
      })
    )
  })

  it("returns error if delete returns null", async () => {
    ;(prisma.savedCompany.delete as jest.Mock).mockResolvedValue(null)

    const result = await unsaveCRO({ id: "org1" } as any, savedCompanyId)

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })

  it("handles database errors", async () => {
    ;(prisma.savedCompany.delete as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await unsaveCRO({ id: "org1" } as any, savedCompanyId)

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })
})

describe("unsaveOrganization", () => {
  const savedOrganizationId = "savedOrg1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("successfully unsaves an organization", async () => {
    const mockResponse = {
      id: savedOrganizationId,
      organization: { id: "org1", name: "Org 1" },
      savedOrganization: { id: "org2", name: "Org 2" },
    }

    ;(prisma.savedOrganization.delete as jest.Mock).mockResolvedValue(mockResponse)

    const result = await unsaveOrganization({ id: "org1" } as any, savedOrganizationId)

    expect(result).toEqual({ success: true, data: mockResponse })
    expect(prisma.savedOrganization.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: savedOrganizationId },
        include: { organization: true, savedOrganization: true },
      })
    )
  })

  it("returns error if delete returns null", async () => {
    ;(prisma.savedOrganization.delete as jest.Mock).mockResolvedValue(null)

    const result = await unsaveOrganization({ id: "org1" } as any, savedOrganizationId)

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })

  it("handles database errors", async () => {
    ;(prisma.savedOrganization.delete as jest.Mock).mockRejectedValue(new Error("DB failure"))

    const result = await unsaveOrganization({ id: "org1" } as any, savedOrganizationId)

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })
})

describe("submitFeedback", () => {
  const reviewId = "review1"
  const userId = "user1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("creates new feedback if none exists", async () => {
    ;(prisma.reviewFeedback.findUnique as jest.Mock).mockResolvedValue(null)
    const mockCreated = { id: "fb1", reviewId, userId, helpful: true }
    ;(prisma.reviewFeedback.create as jest.Mock).mockResolvedValue(mockCreated)

    const result = await submitFeedback(reviewId, userId, true)

    expect(result).toEqual({ success: true, data: mockCreated })
    expect(prisma.reviewFeedback.create).toHaveBeenCalledWith({
      data: { reviewId, userId, helpful: true },
    })
  })

  it("updates feedback if one already exists", async () => {
    const existing = { id: "fb1", reviewId, userId, helpful: false }
    ;(prisma.reviewFeedback.findUnique as jest.Mock).mockResolvedValue(existing)

    const updated = { ...existing, helpful: true }
    ;(prisma.reviewFeedback.update as jest.Mock).mockResolvedValue(updated)

    const result = await submitFeedback(reviewId, userId, true)

    expect(result).toEqual({ success: true, data: updated })
    expect(prisma.reviewFeedback.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: { helpful: true },
    })
  })

  it("handles database errors", async () => {
    ;(prisma.reviewFeedback.findUnique as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await submitFeedback(reviewId, userId, true)

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    })
  })
})

describe("createPharmaProject", () => {
  beforeEach(() => jest.clearAllMocks())

  it("successfully creates a pharma project", async () => {
    const formData = new FormData()
    formData.set("name", "Test Project")

    const mockProject = { id: "proj1", name: "Test Project" }
    ;(prisma.pharmaProject.create as jest.Mock).mockResolvedValue(mockProject)

    const result = await createPharmaProject(formData)

    expect(result).toEqual({ success: true, data: mockProject })
    expect(prisma.pharmaProject.create).toHaveBeenCalledWith({ data: { name: "Test Project" } })
    expect(revalidatePath).toHaveBeenCalledWith("/(platform)/pharma/project/[id]")
  })

  it("handles errors when creating a pharma project", async () => {
    const formData = new FormData()
    formData.set("name", "Test Project")

    ;(prisma.pharmaProject.create as jest.Mock).mockRejectedValue(new Error("DB error"))

    const result = await createPharmaProject(formData)

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })
  })
});

describe("deletePharmaProject", () => {
  const mockProjectId = "pharma-project-1"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should delete a pharma project and revalidate the path", async () => {
    const mockResponse = { id: mockProjectId }

    ;(prisma.pharmaProject.delete as jest.Mock).mockResolvedValue(mockResponse)

    const result = await deletePharmaProject(mockProjectId)

    expect(prisma.pharmaProject.delete).toHaveBeenCalledWith({
      where: { id: mockProjectId },
    })

    expect(revalidatePath).toHaveBeenCalledWith("/(platform)/pharma")

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    })
  })

  it("should return an error if prisma returns falsy", async () => {
    ;(prisma.pharmaProject.delete as jest.Mock).mockResolvedValue(null)

    const result = await deletePharmaProject(mockProjectId)

    expect(prisma.pharmaProject.delete).toHaveBeenCalledWith({
      where: { id: mockProjectId },
    })

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("should handle prisma errors", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    ;(prisma.pharmaProject.delete as jest.Mock).mockRejectedValue(
      new Error("Database failure")
    )

    const result = await deletePharmaProject(mockProjectId)

    expect(prisma.pharmaProject.delete).toHaveBeenCalledWith({
      where: { id: mockProjectId },
    })

    expect(consoleSpy).toHaveBeenCalled()

    expect(result).toEqual({
      success: false,
      error: "Database error. please try again later.",
    })

    consoleSpy.mockRestore()
  })
})

describe("createMaterialAndDataAccessRequest", () => {
  const mockUser = { id: "user1" } as any

  beforeEach(() => {
    jest.clearAllMocks()

    process.env.NEXT_PUBLIC_TYPESENSE_NODE = "typesense-node"
    process.env.NEXT_PUBLIC_NODE_ENV = "development"
    process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY = "key"
  })

  const buildFormData = () => {
    const formData = new FormData()

    const payload = {
      name: "Test Request",
      description: "Test description",
      organizationId: "org1",
      openToCollab: true,

      projectDetails: {
        studyTitle: "Study",
        studyDescription: "Description",
        justification: "Justification",
        hasIrbApproval: true,
        irbStatus: "approved",
        hasRisks: false,
        riskDescription: "",
        disseminationPlan: "Plan",
        patientSignificance: "Important",
      },

      sampleDetails: {
        sampleTypes: ["blood"],
        otherSampleType: "",
        participantCount: 10,
        processingRequirements: "None",
      },

      logistics: {
        timeline: "3 months",
        logisticsContact: "Jane",
        providesCollectionKit: true,
        needsCollectionMaterials: false,
        participantCompensation: false,
        compensationDetails: "",
        shippingAddress: "123 street",
        fedexAccount: "123",
        shippingMethod: "FedEx",
        shippingContact: "John",
        shippingPhone: "555-5555",
      },

      commercial: {
        isCommercial: false,
        fundingOrganization: "NIH",
      },

      agreements: {},
      metadata: {},
    }

    formData.set("data", JSON.stringify(payload))

    return formData
  }

  it("should create a request successfully", async () => {
    const formData = buildFormData()

    const mockRequest = {
      id: "req1",
      title: "Test Request",
      submittedAt: new Date(),
      organization: {
        id: "org1",
        name: "Org",
        subdomain: "org",
        image: null,
      },
      researcher: {
        id: "researcher1",
      },
    }

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1", name: "Test User" },
    })

    ;(prisma.materialAndDataAccessRequest.create as jest.Mock).mockResolvedValue(
      mockRequest
    )

    const result = await createMaterialAndDataAccessRequest(mockUser, formData)

    expect(prisma.materialAndDataAccessRequest.create).toHaveBeenCalled()

    expect(writeRawEvent).toHaveBeenCalled()

    expect(addTypeSenseDocument).toHaveBeenCalled()

    expect(revalidatePath).toHaveBeenCalledWith("/requests")

    expect(result).toEqual({
      success: true,
      data: mockRequest,
    })
  })

  it("should return error if not authenticated", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)

    const result = await createMaterialAndDataAccessRequest(
      mockUser,
      new FormData()
    )

    expect(result).toEqual({
      error: "Not authenticated",
    })
  })

  it("should handle prisma unique constraint error", async () => {
    const formData = buildFormData()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1" },
    })

    const prismaError = {
      code: "P2002",
      meta: { target: ["title"] },
    }

    ;(
      prisma.materialAndDataAccessRequest.create as jest.Mock
    ).mockRejectedValue(prismaError)

    const result = await createMaterialAndDataAccessRequest(mockUser, formData)

    expect(result).toEqual({
      error: "Unique constraint failed on title",
    })
  })

  it("should handle generic errors", async () => {
    const formData = buildFormData()

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1" },
    })

    ;(
      prisma.materialAndDataAccessRequest.create as jest.Mock
    ).mockRejectedValue(new Error("Database failure"))

    const result = await createMaterialAndDataAccessRequest(mockUser, formData)

    expect(result).toEqual({
      error: "Database failure",
    })
  })
})

describe("updateMaterialAndDataAccessRequestProperty", () => {
  const mockUser = { id: "user1", name: "Test User" };
  const mockRequestId = "req1";

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.NEXT_PUBLIC_TYPESENSE_NODE = "typesense-node";
    process.env.NEXT_PUBLIC_NODE_ENV = "development";
    process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY = "key";
  });

  it("should update a property successfully", async () => {
    const updatedRequest = { id: mockRequestId, title: "Request 1", organizationId: "org1", organization: { id: "org1", name: "Org", subdomain: "org", image: null } };
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.materialAndDataAccessRequest.update as jest.Mock).mockResolvedValue(updatedRequest);

    const result = await updateMaterialAndDataAccessRequestProperty(mockRequestId, "sampleCount", 10);

    expect(prisma.materialAndDataAccessRequest.update).toHaveBeenCalledWith({
      where: { id: mockRequestId },
      include: { organization: true },
      data: { sampleCount: 10 },
    });
    expect(updateTypeSenseDocument).toHaveBeenCalledWith(
      `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE}`,
      process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY,
      updatedRequest,
      'requests'
    );
    expect(revalidatePath).toHaveBeenCalledWith("/requests");
    expect(result).toEqual({ success: true, data: updatedRequest });
  });

  it("should return error if not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await updateMaterialAndDataAccessRequestProperty(mockRequestId, "sampleCount", 10);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(prisma.materialAndDataAccessRequest.update).not.toHaveBeenCalled();
  });

  it("should return error for unsupported property", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });

    const result = await updateMaterialAndDataAccessRequestProperty(mockRequestId, "invalidProp", 123);

    expect(result).toEqual({ success: false, error: "Unsupported property." });
    expect(prisma.materialAndDataAccessRequest.update).not.toHaveBeenCalled();
  });

  it("should write event if status is APPROVED", async () => {
    const updatedRequest = { id: mockRequestId, title: "Request 1", organizationId: "org1", organization: { id: "org1", name: "Org", subdomain: "org", image: null } };
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.materialAndDataAccessRequest.update as jest.Mock).mockResolvedValue(updatedRequest);

    const result = await updateMaterialAndDataAccessRequestProperty(mockRequestId, "status", "APPROVED");

    expect(writeRawEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "tool_request_approved",
      externalId: mockRequestId,
      payload: expect.objectContaining({
        requestId: mockRequestId,
        title: "Request 1",
        approverUserId: mockUser.id,
      }),
    }));
    expect(result).toEqual({ success: true, data: updatedRequest });
  });

  it("should handle server errors gracefully", async () => {
    (getSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.materialAndDataAccessRequest.update as jest.Mock).mockRejectedValue(new Error("DB failed"));

    const result = await updateMaterialAndDataAccessRequestProperty(mockRequestId, "sampleCount", 10);

    expect(result).toEqual({ success: false, error: "Server error occurred." });
  });
});

describe("switchOrganization", () => {
  const mockUser = { id: "user1" }
  const orgId = "org1"
  const PATHS = [
      "/app",
      "/app/profile",
      "/app/dashboard",
      "/app/notifications",
      "/app/team",
      "/app/settings",
      "/app/tools/biosample",
      "/app/tools/disease-models",
      "/app/tools/data",
      "/app/rfps",
      "/app/requests",
      "/app/research-plan",
  ]

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const result = await switchOrganization(orgId);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(prisma.member.findFirst).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("should return error if user is not a member of the org", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.member.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await switchOrganization(orgId);

    expect(result).toEqual({ success: false, error: "Not authorized for this organization" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("should switch organization successfully and revalidate paths", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: mockUser });
    (prisma.member.findFirst as jest.Mock).mockResolvedValue({ id: "membership1" });
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: mockUser.id, activeOrganizationId: orgId });

    const result = await switchOrganization(orgId);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { activeOrganizationId: orgId },
    });

    for (const path of PATHS) {
      expect(revalidatePath).toHaveBeenCalledWith(path);
    }

    expect(result).toEqual({ success: true });
  });
});

describe("subscribeToOrganization", () => {
  const email = "user@example.com";
  const host = "org.example.com";
  const orgId = "org1";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com";
  });

  it("returns error if email domain is invalid", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(false);

    const result = await subscribeToOrganization(email, host);

    expect(result).toEqual({
      success: false,
      error: "Email domain is invalid or cannot receive emails.",
    });
  });

  it("returns error if host is missing", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);

    const result = await subscribeToOrganization(email, null);

    expect(result).toEqual({
      success: false,
      error: "Missing host.",
    });
  });

  it("returns error if organization not found", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);
    ;(prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await subscribeToOrganization(email, host);

    expect(result).toEqual({
      success: false,
      error: "Organization not found.",
    });
  });

  it("returns error if already subscribed", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);
    ;(prisma.organization.findFirst as jest.Mock).mockResolvedValue({ id: orgId, subdomain: "org" });
    ;(prisma.subscription.findFirst as jest.Mock).mockResolvedValue({ id: "sub1" });

    const result = await subscribeToOrganization(email, host);

    expect(result).toEqual({
      success: false,
      error: "You're already subscribed to this organization.",
    });
  });

  it("creates subscription successfully", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);
    ;(prisma.organization.findFirst as jest.Mock).mockResolvedValue({ id: orgId, subdomain: "org" });
    ;(prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    ;(prisma.subscription.create as jest.Mock).mockResolvedValue({ id: "sub123" });

    const result = await subscribeToOrganization(email, host);

    expect(prisma.subscription.create).toHaveBeenCalledWith({
      data: { organizationId: orgId, email: email.toLowerCase() },
      select: { id: true },
    });

    expect(customerIOTrack).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "user_subscribed_to_organization",
        traits: expect.objectContaining({ email: email.toLowerCase(), organization_id: orgId }),
      })
    );

    expect(result).toEqual({ success: true, data: { id: "sub123" } });
  });

  it("handles P2002 unique constraint error", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);
    ;(prisma.organization.findFirst as jest.Mock).mockResolvedValue({ id: orgId, subdomain: "org" });
    ;(prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    ;(prisma.subscription.create as jest.Mock).mockRejectedValue({ code: "P2002" });

    const result = await subscribeToOrganization(email, host);

    expect(result).toEqual({
      success: false,
      error: "You're already subscribed to this organization.",
    });
  });

  it("handles generic database errors", async () => {
    ;(validateEmailDomain as jest.Mock).mockResolvedValue(true);
    ;(prisma.organization.findFirst as jest.Mock).mockResolvedValue({ id: orgId, subdomain: "org" });
    ;(prisma.subscription.findFirst as jest.Mock).mockResolvedValue(null);
    ;(prisma.subscription.create as jest.Mock).mockRejectedValue(new Error("DB failure"));

    const result = await subscribeToOrganization(email, host);

    expect(result).toEqual({
      success: false,
      error: "Database error. Please try again later.",
    });
  });
});

describe("updateEntityTags", () => {
  const userSession = { user: { id: "user1", name: "Test User" } };
  const taggableType = "MATERIAL_AND_DATA_ACCESS_REQUEST";
  const taggableId = "entity1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if not authenticated", async () => {
    (getSession as jest.Mock).mockResolvedValue(null);

    const result = await updateEntityTags(taggableType, taggableId, ["tag1"]);

    expect(result).toEqual({
      success: false,
      error: "Not authenticated",
    });
  });

  it("returns error if missing taggableId", async () => {
    (getSession as jest.Mock).mockResolvedValue(userSession);

    const result = await updateEntityTags(taggableType, "", ["tag1"]);

    expect(result).toEqual({
      success: false,
      error: "Missing taggableId",
    });
  });

  it("clears tags when normalized array is empty", async () => {
    (getSession as jest.Mock).mockResolvedValue(userSession);
    (normalizeTag as jest.Mock).mockReturnValue(null);
    (prisma.tagAssignment.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

    const result = await updateEntityTags(taggableType, taggableId, [""]);

    expect(prisma.tagAssignment.deleteMany).toHaveBeenCalledWith({
      where: { taggableType, taggableId },
    });

    expect(result).toEqual({
      success: true,
      data: { assignments: [] },
    });
  });

  it("upserts tags and creates assignments successfully", async () => {
    (getSession as jest.Mock).mockResolvedValue(userSession);

    (normalizeTag as jest.Mock).mockImplementation((t) => ({
      display: t,
      normalized: t.toLowerCase(),
    }));

    const tags = [{ id: "tag1" }, { id: "tag2" }];

    // Mock the transaction
    (prisma.$transaction as jest.Mock).mockImplementation(async (fn: any) => {
      return fn({
        tag: { upsert: jest.fn().mockImplementation(({ create }) => ({ id: create.value })) },
        tagAssignment: {
          deleteMany: jest.fn(),
          createMany: jest.fn(),
          findMany: jest.fn().mockResolvedValue([
            { id: "a1", tag: { id: "tag1", value: "Tag1", normalizedValue: "tag1" } },
            { id: "a2", tag: { id: "tag2", value: "Tag2", normalizedValue: "tag2" } },
          ]),
        },
      });
    });

    const result = await updateEntityTags(taggableType, taggableId, ["Tag1", "Tag2"]);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data?.assignments.length).toBe(2);
    expect(result.data?.assignments[0].tag.value).toBe("Tag1");
    expect(result.data?.assignments[1].tag.value).toBe("Tag2");
  });

  it("handles errors gracefully", async () => {
    (getSession as jest.Mock).mockResolvedValue(userSession);
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error("Database error"));

    const result = await updateEntityTags(taggableType, taggableId, ["Tag1"]);

    expect(result).toEqual({
      success: false,
      error: "Server error occurred.",
    });
  });
});