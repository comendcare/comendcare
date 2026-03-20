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

// Mock the DB calls
jest.mock("./prisma", () => ({
  __esModule: true,
  default: {
    milestone: { findMany: jest.fn() },
    invitation: { findMany: jest.fn() },
    memberRequest: { findMany: jest.fn() },
    roadmap: { findMany: jest.fn(), findFirst: jest.fn() },
    edge: { findMany: jest.fn() },
    node: { findMany: jest.fn() },
    organization: { findUnique: jest.fn(), findMany: jest.fn() },
    condition: { findMany: jest.fn(), findUnique: jest.fn() },
    member: { findMany: jest.fn() },
    savedCompany: { findMany: jest.fn() },
    savedOrganization: { findMany: jest.fn() },
    institution: { findMany: jest.fn() },
    company: { findMany: jest.fn(), findUnique: jest.fn() },
    createFacilityRequest: { findMany: jest.fn() },
    biosample: { count: jest.fn() },
    diseaseModel: { count: jest.fn() },
    tool: { count: jest.fn(), findMany: jest.fn() },
    rFP: { findMany: jest.fn(), findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    follow: { findUnique: jest.fn() },
    platformNotification: { findMany: jest.fn() },
    researcher: { findUnique: jest.fn() },
    donor: { findUnique: jest.fn() },
    pharmaProject: { findUnique: jest.fn() },
    materialAndDataAccessRequest: { findMany: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  }
}))

jest.mock("./auth", () => ({
  authOptions: jest.fn(),
  getSession: jest.fn(),
  withAuth: (fn: any) => fn, // bypass authentication (tested separately in auth.test.ts)
  withOrganizationAuth: <T extends (...args: any[]) => any>(fn: T): T => fn, // bypass authentication (tested separately in auth.test.ts)
  withUserAuth: (fn?: any) => fn, // bypass authentication (tested separately in auth.test.ts)
}))

jest.mock("./utils", () => ({
  logError: jest.fn(),
}))

jest.mock("fs/promises")

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

import { 
    fetchCreateRequests, 
    findCompanies, 
    findInstitutions, 
    getAllMembershipsFromUserId, 
    getAllNonMemberOrganizations, 
    getAllOrganizationRequests, 
    getAllOrganizations, 
    getAssets, 
    getConditionsDataFromOrgId, 
    getConditionsFromOrganizationId, 
    getDonorData, 
    getInvitations, 
    getMemberRequestsWithUsers, 
    getMilestones, 
    getOrganizationFromOrganizationId, 
    getPharmaProjectData, 
    getPublicConditionData, 
    getPublicRFP, 
    getPublicToolCountsForOrganization, 
    getResearcherRequest, 
    getRFPs, 
    getRoadmap, 
    getRoadmapEdges, 
    getRoadmapMilestones, 
    getRoadmapNodes, 
    getSavedCompaniesFromOrganizationId, 
    getSavedOrganizationsFromOrganizationId, 
    getServicesOfCompany, 
    getUser, 
     
} from "./fetchers"
import prisma from "./prisma"
import { getSession } from "./auth"

const mockOrg = { id: "org1" } as any
const mockUser = { id: "user1" } as any

beforeEach(() => {
  jest.clearAllMocks()
})

describe("findInstitutions", () => {
  const mockSelect = {
    id: true,
    name: true,
  }

  const institutionIds = ["inst1", "inst2"]

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return institutions when prisma query succeeds", async () => {
    const mockInstitutions = [
      { id: "inst1", name: "Institution 1" },
      { id: "inst2", name: "Institution 2" },
    ]

    ;(prisma.institution.findMany as jest.Mock).mockResolvedValue(
      mockInstitutions
    )

    const result = await findInstitutions(institutionIds, mockSelect as any)

    expect(prisma.institution.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: institutionIds },
      },
      select: mockSelect,
    })

    expect(result).toEqual({
      success: true,
      data: mockInstitutions,
    })
  })

  it("should return error response when prisma throws", async () => {
    const error = new Error("Database error")

    ;(prisma.institution.findMany as jest.Mock).mockRejectedValue(error)

    const result = await findInstitutions(institutionIds, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })

  it("should pass the correct institutionIds to prisma", async () => {
    ;(prisma.institution.findMany as jest.Mock).mockResolvedValue([])

    await findInstitutions(institutionIds, mockSelect as any)

    expect(prisma.institution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: { in: institutionIds },
        },
      })
    )
  })
})

describe("findCompanies", () => {
  const companyIds = ["comp1", "comp2"]
  const mockSelect = { id: true, name: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return companies when prisma query succeeds", async () => {
    const mockCompanies = [
      { id: "comp1", name: "Company 1" },
      { id: "comp2", name: "Company 2" },
    ]

    ;(prisma.company.findMany as jest.Mock).mockResolvedValue(mockCompanies)

    const result = await findCompanies(companyIds, mockSelect as any)

    expect(prisma.company.findMany).toHaveBeenCalledWith({
      where: { id: { in: companyIds } },
      select: mockSelect,
    })

    expect(result).toEqual({
      success: true,
      data: mockCompanies,
    })
  })

  it("should return error response when prisma throws", async () => {
    ;(prisma.company.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    )

    const result = await findCompanies(companyIds, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("fetchCreateRequests", () => {
  const milestoneId = "milestone1"
  const mockSelect = { id: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return create requests when prisma query succeeds", async () => {
    const mockRequests = [{ id: "req1" }]

    ;(prisma.createFacilityRequest.findMany as jest.Mock).mockResolvedValue(mockRequests)

    const result = await fetchCreateRequests(milestoneId, mockSelect as any)

    expect(prisma.createFacilityRequest.findMany).toHaveBeenCalledWith({
      where: { milestoneId },
      select: mockSelect,
    })

    expect(result).toEqual({
      success: true,
      data: mockRequests,
    })
  })

  it("should return error response when prisma throws", async () => {
    ;(prisma.createFacilityRequest.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    )

    const result = await fetchCreateRequests(milestoneId, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("getServicesOfCompany", () => {
  const companyId = "company1"
  const mockSelect = { id: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return services when company exists", async () => {
    const mockServices = [{ id: "service1" }]

    ;(prisma.company.findUnique as jest.Mock).mockResolvedValue({
      services: mockServices,
    })

    const result = await getServicesOfCompany(companyId, mockSelect as any)

    expect(prisma.company.findUnique).toHaveBeenCalledWith({
      where: { id: companyId },
      select: {
        services: { select: mockSelect },
      },
    })

    expect(result).toEqual({
      success: true,
      data: mockServices,
    })
  })

  it("should return error when company not found", async () => {
    ;(prisma.company.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getServicesOfCompany(companyId, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: `Services not found, could not find company with id: ${companyId}`,
    })
  })

  it("should return error when services missing", async () => {
    ;(prisma.company.findUnique as jest.Mock).mockResolvedValue({
      services: null,
    })

    const result = await getServicesOfCompany(companyId, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: `Services not found`,
    })
  })

  it("should return error response when prisma throws", async () => {
    ;(prisma.company.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    )

    const result = await getServicesOfCompany(companyId, mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("getPublicToolCountsForOrganization", () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return tool counts", async () => {
    process.env.NEXT_PUBLIC_ROOT_DOMAIN = "example.com"

    ;(prisma.biosample.count as jest.Mock).mockResolvedValue(3)
    ;(prisma.diseaseModel.count as jest.Mock).mockResolvedValue(5)
    ;(prisma.tool.count as jest.Mock).mockResolvedValue(7)

    const result = await getPublicToolCountsForOrganization("org.example.com")

    expect(prisma.biosample.count).toHaveBeenCalled()
    expect(prisma.diseaseModel.count).toHaveBeenCalled()
    expect(prisma.tool.count).toHaveBeenCalled()

    expect(result).toEqual({
      biosampleCount: 3,
      diseaseModelCount: 5,
      clinicalDatasetCount: 7,
    })
  })
})

describe("getPublicRFP", () => {
  const mockSelect = { id: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return rfp", async () => {
    const mockRFP = { id: "rfp1" }

    ;(prisma.rFP.findUnique as jest.Mock).mockResolvedValue(mockRFP)

    const result = await getPublicRFP("rfp1", mockSelect as any)

    expect(prisma.rFP.findUnique).toHaveBeenCalled()

    expect(result).toEqual(mockRFP)
  })
})

describe("getConditionsDataFromOrgId", () => {
  const mockSelect = { id: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return conditions", async () => {
    const mockConditions = [{ id: "cond1" }]

    ;(prisma.condition.findMany as jest.Mock).mockResolvedValue(mockConditions)

    const result = await getConditionsDataFromOrgId("org1", mockSelect as any)

    expect(prisma.condition.findMany).toHaveBeenCalled()

    expect(result).toEqual({
      success: true,
      data: mockConditions,
    })
  })

  it("should return error when prisma throws", async () => {
    ;(prisma.condition.findMany as jest.Mock).mockRejectedValue(
      new Error("Database error")
    )

    const result = await getConditionsDataFromOrgId("org1", mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Internal server error",
    })
  })
})

describe("getPublicConditionData", () => {
  const mockSelect = { id: true }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should return condition data", async () => {
    const mockCondition = { id: "cond1" }

    ;(prisma.condition.findUnique as jest.Mock).mockResolvedValue(mockCondition)

    const result = await getPublicConditionData("slug1", mockSelect as any)

    expect(result).toEqual({
      success: true,
      data: mockCondition,
    })
  })

  it("should return error when condition not found", async () => {
    ;(prisma.condition.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getPublicConditionData("slug1", mockSelect as any)

    expect(result).toEqual({
      success: false,
      error: "Condition not found",
    })
  })
})

describe("getAssets", () => {
  it("returns assets", async () => {
    const assets = [{ id: "a1" }]
    ;(prisma.tool.findMany as jest.Mock).mockResolvedValue(assets)

    const result = await getAssets(mockOrg, { id: true } as any)

    expect(prisma.tool.findMany).toHaveBeenCalled()
    expect(result).toEqual({ success: true, data: assets })
  })

  it("handles errors", async () => {
    ;(prisma.tool.findMany as jest.Mock).mockRejectedValue(new Error("fail"))

    const result = await getAssets(mockOrg, { id: true } as any)

    expect(result.success).toBe(false)
  })
})

describe("getRFPs", () => {
  it("returns rfps", async () => {
    const rfps = [{ id: "r1" }]
    ;(prisma.rFP.findMany as jest.Mock).mockResolvedValue(rfps)

    const result = await getRFPs(mockOrg, { id: true } as any)

    expect(result).toEqual({ success: true, data: rfps })
  })
})

describe("getMilestones", () => {
  it("returns milestones", async () => {
    const milestones = [{ id: "m1" }]
    ;(prisma.milestone.findMany as jest.Mock).mockResolvedValue(milestones)

    const result = await getMilestones(mockOrg, { id: true } as any)

    expect(result).toEqual({ success: true, data: milestones })
  })
})

describe("getInvitations", () => {
  it("returns invitations for session email", async () => {
    const invites = [{ id: "i1" }]

    ;(getSession as jest.Mock).mockResolvedValue({
      user: { email: "test@test.com" }
    })

    ;(prisma.invitation.findMany as jest.Mock).mockResolvedValue(invites)

    const result = await getInvitations({ id: true } as any)

    expect(result).toEqual({ success: true, data: invites })
  })

  it("returns error if no session", async () => {
    ;(getSession as jest.Mock).mockResolvedValue(null)

    const result = await getInvitations({ id: true } as any)

    expect(result.success).toBe(false)
  })
})

describe("getMemberRequestsWithUsers", () => {
  it("returns member requests", async () => {
    (prisma.memberRequest.findMany as jest.Mock).mockResolvedValue([{ id: "mr1" }])

    const result = await getMemberRequestsWithUsers(mockOrg, { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getRoadmapEdges", () => {
  it("returns edges", async () => {
    (prisma.edge.findMany as jest.Mock).mockResolvedValue([{ id: "e1" }])

    const result = await getRoadmapEdges(mockOrg, "road1", { id: true } as any)

    expect(result.success).toBe(true)
  })

  it("fails without roadmapId", async () => {
    const result = await getRoadmapEdges(mockOrg, null, { id: true } as any)

    expect(result.success).toBe(false)
  })
})

describe("getRoadmapNodes", () => {
  it("returns nodes", async () => {
    (prisma.node.findMany as jest.Mock).mockResolvedValue([{ id: "n1" }])

    const result = await getRoadmapNodes(mockOrg, "road1", { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getRoadmapMilestones", () => {
  it("returns milestones", async () => {
    (prisma.milestone.findMany as jest.Mock).mockResolvedValue([{ id: "m1" }])

    const result = await getRoadmapMilestones(mockOrg, "road1", { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getRoadmap", () => {
  it("returns roadmap", async () => {
    ;(prisma.organization.findUnique as jest.Mock).mockResolvedValue({ id: "org1" })
    ;(prisma.roadmap.findFirst as jest.Mock).mockResolvedValue({ id: "road1" })

    const result = await getRoadmap(mockOrg, "road1", { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getOrganizationFromOrganizationId", () => {
  it("returns organization", async () => {
    (prisma.organization.findUnique as jest.Mock).mockResolvedValue({
      id: "org1",
      members: []
    })

    const result = await getOrganizationFromOrganizationId(mockOrg, {
      id: true,
      members: true
    } as any)

    expect(result.success).toBe(true)
  })
})

describe("getConditionsFromOrganizationId", () => {
  it("returns conditions", async () => {
    (prisma.condition.findMany as jest.Mock).mockResolvedValue([{ id: "c1" }])

    const result = await getConditionsFromOrganizationId(mockOrg, { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getAllNonMemberOrganizations", () => {
  it("returns organizations", async () => {
    ;(getSession as jest.Mock).mockResolvedValue({
      user: { id: "user1" }
    })

    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue([{ id: "org2" }])

    const result = await getAllNonMemberOrganizations({ id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getAllMembershipsFromUserId", () => {
  it("returns memberships", async () => {
    (prisma.member.findMany as jest.Mock).mockResolvedValue([{ id: "mem1" }])

    const result = await getAllMembershipsFromUserId(mockUser, { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getSavedCompaniesFromOrganizationId", () => {
  it("returns saved companies", async () => {
    (prisma.savedCompany.findMany as jest.Mock).mockResolvedValue([{ id: "sc1" }])

    const result = await getSavedCompaniesFromOrganizationId(mockOrg, { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getSavedOrganizationsFromOrganizationId", () => {
  it("returns saved organizations", async () => {
    (prisma.savedOrganization.findMany as jest.Mock).mockResolvedValue([{ id: "so1" }])

    const result = await getSavedOrganizationsFromOrganizationId(mockOrg, { id: true } as any)

    expect(result.success).toBe(true)
  })
})

describe("getUser", () => {
  const mockSelect = { id: true, email: true }

  it("should return user data when prisma query succeeds", async () => {
    const fetchedUser = { id: "user1", email: "test@example.com" }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(fetchedUser)

    const result = await getUser(mockUser, mockSelect as any)

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      select: mockSelect,
    })
    expect(result).toEqual({ success: true, data: fetchedUser })
  })

  it("should return error if user not found", async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getUser(mockUser, mockSelect as any)

    expect(result).toEqual({ success: false, error: "User not found" })
  })

  it("should return internal server error if prisma throws", async () => {
    const error = new Error("DB error")
    ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(error)

    const result = await getUser(mockUser, mockSelect as any)

    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

describe("getDonorData", () => {
  const donorId = "donor1"

  it("should return donor data when prisma query succeeds", async () => {
    const donor = { id: donorId, diagnoses: [] }
    ;(prisma.donor.findUnique as jest.Mock).mockResolvedValue(donor)

    const result = await getDonorData(donorId)

    expect(prisma.donor.findUnique).toHaveBeenCalledWith({
      where: { id: donorId },
      include: { diagnoses: { include: { type: true } } },
    })
    expect(result).toEqual({ success: true, data: donor })
  })

  it("should return error if prisma throws", async () => {
    const error = new Error("DB error")
    ;(prisma.donor.findUnique as jest.Mock).mockRejectedValue(error)

    const result = await getDonorData(donorId)

    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

describe("getPharmaProjectData", () => {
  it("should return project data", async () => {
    const project = { id: "p1", name: "Project 1" }
    ;(prisma.pharmaProject.findUnique as jest.Mock).mockResolvedValue(project)

    const result = await getPharmaProjectData("p1", { id: true, name: true })

    expect(prisma.pharmaProject.findUnique).toHaveBeenCalledWith({
      where: { id: "p1" },
      select: { id: true, name: true },
    })
    expect(result).toEqual(project)
  })

  it("should return null if project not found", async () => {
    ;(prisma.pharmaProject.findUnique as jest.Mock).mockResolvedValue(null)
    const result = await getPharmaProjectData("p1", { id: true })
    expect(result).toBeNull()
  })
})

describe("getAllOrganizations", () => {
  const mockSelect = { id: true, name: true }

  it("should return organizations on success", async () => {
    const organizations = [{ id: "org1", name: "Org 1" }]
    ;(prisma.organization.findMany as jest.Mock).mockResolvedValue(organizations)

    const result = await getAllOrganizations(mockSelect as any)

    expect(prisma.organization.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
      select: mockSelect,
    })
    expect(result).toEqual({ success: true, data: organizations })
  })

  it("should return error on prisma failure", async () => {
    const error = new Error("DB error")
    ;(prisma.organization.findMany as jest.Mock).mockRejectedValue(error)

    const result = await getAllOrganizations(mockSelect as any)

    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})

describe("getResearcherRequest", () => {
  it("should return request if found", async () => {
    const request = { id: "req1" }
    ;(prisma.materialAndDataAccessRequest.findUnique as jest.Mock).mockResolvedValue(request)

    const result = await getResearcherRequest(mockUser, { where: { id: "req1" }, select: { id: true } })

    expect(result).toEqual({ success: true, data: request })
  })

  it("should return error if request not found", async () => {
    ;(prisma.materialAndDataAccessRequest.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getResearcherRequest(mockUser, { where: { id: "req1" }, select: { id: true } })

    expect(result).toEqual({ success: false, error: "Request not found" })
  })
})

describe("getAllOrganizationRequests", () => {
  it("should return requests if found", async () => {
    const requests = [{ id: "r1" }]
    ;(prisma.materialAndDataAccessRequest.findMany as jest.Mock).mockResolvedValue(requests)

    const result = await getAllOrganizationRequests(mockOrg, {}, { id: true })

    expect(result).toEqual({ success: true, data: requests })
  })

  it("should handle prisma error", async () => {
    const error = new Error("DB error")
    ;(prisma.materialAndDataAccessRequest.findMany as jest.Mock).mockRejectedValue(error)

    const result = await getAllOrganizationRequests(mockOrg, {}, { id: true })
    expect(result).toEqual({ success: false, error: "Internal server error" })
  })
})
