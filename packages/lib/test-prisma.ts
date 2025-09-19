// prisma.ts

// Always import `db` from `db.ts` and use that instance directly
import { testDb } from "./test-db"

// Export the cached `db` directly
export default testDb
