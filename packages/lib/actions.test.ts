import { setBiosamplesVisibilityCore } from "./actions"
import prisma from "./prisma"
import { revalidatePath } from "next/cache"

jest.mock("./prisma", () => ({
  prisma: {
    biosample: {
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("setBiosamplesVisibilityCore", () => {
  const mockOrganization = { id: "org-123" } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("updates biosamples and revalidates path", async () => {
    ;(prisma.biosample.updateMany as jest.Mock).mockResolvedValue({
      count: 2,
    })

    const result = await setBiosamplesVisibilityCore(
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
      setBiosamplesVisibilityCore(
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
      setBiosamplesVisibilityCore(mockOrganization, ["bio1"], true)
    ).rejects.toThrow("DB failed")
  })
})