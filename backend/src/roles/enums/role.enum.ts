const Roles = {
    User: "user",
    Admin: "admin"
} as const

type RoleEnum = typeof Roles[keyof typeof Roles]

export { RoleEnum, Roles }
