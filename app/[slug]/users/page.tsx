import { UsersClient } from "@/components/users"
import { getUsers } from "@/lib/mock-data"

export default async function UsersPage() {
  const users = await getUsers()

  return <UsersClient initialUsers={users} />
}

