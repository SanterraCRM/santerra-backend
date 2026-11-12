export const PERMISSIONS = {
  COMPANY_UPDATE: "company.update",

  PERSONS_READ: "persons.read",
  PERSONS_CREATE: "persons.create",
  PERSONS_UPDATE: "persons.update",
  PERSONS_DELETE: "persons.delete",

  PRODUCTS_READ: "products.read",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",

  ROLES_READ: "roles.read",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",

  MEMBERS_READ: "members.read",
  MEMBERS_UPDATE: "members.update",
  MEMBERS_DELETE: "members.delete",

  INVITATIONS_READ: "invitations.read",
  INVITATIONS_CREATE: "invitations.create",
  INVITATIONS_DELETE: "invitations.delete",

  WALLETS_READ: "wallets.read",
  WALLETS_CREATE: "wallets.create",
  WALLETS_UPDATE: "wallets.update",
  WALLETS_DELETE: "wallets.delete",

  FILES_READ: "files.read",
  FILES_CREATE: "files.create",
  FILES_UPDATE: "files.update",
  FILES_DELETE: "files.delete",

  PRODUCERS_READ: "producers.read",
  PRODUCERS_CREATE: "producers.create",
  PRODUCERS_UPDATE: "producers.update",
  PRODUCERS_DELETE: "producers.delete",

  EVENTS_READ: "events.read",
  EVENTS_CREATE: "events.create",
  EVENTS_UPDATE: "events.update",
  EVENTS_DELETE: "events.delete",

  POTENTIALS_READ: "potentials.read",
  POTENTIALS_CREATE: "potentials.create",
  POTENTIALS_UPDATE: "potentials.update",
  POTENTIALS_DELETE: "potentials.delete",

  RESELLERS_READ: "resellers.read",
  RESELLERS_CREATE: "resellers.create",
  RESELLERS_UPDATE: "resellers.update",
  RESELLERS_DELETE: "resellers.delete",

  EMPLOYEES_READ: "employees.read",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_UPDATE: "employees.update",
  EMPLOYEES_DELETE: "employees.delete",

  GROUPS_READ: "groups.read",
  GROUPS_CREATE: "groups.create",
  GROUPS_UPDATE: "groups.update",
  GROUPS_DELETE: "groups.delete",

  COMMERCIAL_TRIPS_READ: "commercial-trips.read",
  COMMERCIAL_TRIPS_CREATE: "commercial-trips.create",
  COMMERCIAL_TRIPS_UPDATE: "commercial-trips.update",
  COMMERCIAL_TRIPS_DELETE: "commercial-trips.delete",

  COMMERCIAL_ACTIONS_READ: "commercial-actions.read",
  COMMERCIAL_ACTIONS_CREATE: "commercial-actions.create",
  COMMERCIAL_ACTIONS_UPDATE: "commercial-actions.update",
  COMMERCIAL_ACTIONS_DELETE: "commercial-actions.delete",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionName[] = Object.values(PERMISSIONS);
