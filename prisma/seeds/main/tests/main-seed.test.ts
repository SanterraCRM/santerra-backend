import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import argon2 from "argon2";

import {
  ALL_PERMISSIONS,
  PERMISSIONS,
} from "../../../../src/shared/application/auth/permissions";
import { describeError } from "../output";
import { ROLES } from "../roles";
import { BACKEND_ROOT, createTestDatabase, TestDatabase } from "./test-database";

const SEED_ENTRY = path.join(BACKEND_ROOT, "prisma/seeds/main/index.ts");
const PASSWORD = "Senha#Main12";
const OTHER_PASSWORD = "Outra#Senha#2026";
const SHORT_PASSWORD = "Curta#2026!";

const ADMIN_MEMBERSHIP = {
  email: "admin@santerra.com",
  company: "Santerra",
  isOwner: false,
  active: true,
  roles: ["Administrador"],
};

let database: TestDatabase;

function runSeed(env: NodeJS.ProcessEnv = {}, args: string[] = []) {
  const result = spawnSync(process.execPath, ["--import", "tsx", SEED_ENTRY, ...args], {
    cwd: BACKEND_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URL: database.url,
      NODE_ENV: "production",
      SEED_CONFIRM: "main",
      SEED_ADMIN_PASSWORD: PASSWORD,
      ...env,
    },
  });
  const output = `${result.stdout}${result.stderr}`;

  for (const secret of [PASSWORD, OTHER_PASSWORD, SHORT_PASSWORD, "$argon2"]) {
    assert.ok(!output.includes(secret), "A saída da seed mostrou a senha ou o hash.");
  }

  return { status: result.status, output };
}

function byName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((first, second) => first.name.localeCompare(second.name));
}

async function readState() {
  const { prisma } = database;
  const [companies, users, memberships, roles] = await Promise.all([
    prisma.company.findMany({ select: { name: true, description: true } }),
    prisma.user.findMany({
      select: { name: true, email: true, isPlatformAdmin: true, active: true, passwordHash: true },
    }),
    prisma.userCompany.findMany({
      select: {
        isOwner: true,
        active: true,
        user: { select: { email: true } },
        company: { select: { name: true } },
        userRoles: { select: { role: { select: { name: true } } } },
      },
    }),
    prisma.role.findMany({
      select: { name: true, permissions: { select: { permission: { select: { name: true } } } } },
    }),
  ]);

  return {
    companies,
    users,
    memberships: memberships.map(({ user, company, isOwner, active, userRoles }) => ({
      email: user.email,
      company: company.name,
      isOwner,
      active,
      roles: userRoles.map(({ role }) => role.name),
    })),
    roles: byName(
      roles.map(({ name, permissions }) => ({
        name,
        permissions: permissions.map(({ permission }) => permission.name).sort(),
      })),
    ),
  };
}

function expectedRoles() {
  return byName(ROLES.map(({ name, permissions }) => ({ name, permissions: [...permissions].sort() })));
}

async function assertNothingWritten(): Promise<void> {
  assert.deepEqual(await readState(), { companies: [], users: [], memberships: [], roles: [] });
}

describe("seed:main", () => {
  before(async () => {
    database = await createTestDatabase();
  });

  after(async () => {
    await database?.drop();
  });

  for (const nodeEnv of ["development", "test"]) {
    it(`bloqueia NODE_ENV=${nodeEnv} sem --force`, async () => {
      const { status, output } = runSeed({ NODE_ENV: nodeEnv });

      assert.equal(status, 1);
      assert.match(output, new RegExp(`NODE_ENV=${nodeEnv}: a seed da main não roda`));
      await assertNothingWritten();
    });
  }

  it("rejeita senha com menos de 12 caracteres", async () => {
    const { status, output } = runSeed({ SEED_ADMIN_PASSWORD: SHORT_PASSWORD });

    assert.equal(status, 1);
    assert.match(output, /SEED_ADMIN_PASSWORD precisa ter pelo menos 12 caracteres/);
    await assertNothingWritten();
  });

  it("exige SEED_CONFIRM=main", async () => {
    const { status, output } = runSeed({ SEED_CONFIRM: "sim" });

    assert.equal(status, 1);
    assert.match(output, /Defina SEED_CONFIRM=main/);
    await assertNothingWritten();
  });

  it("recusa opção desconhecida", async () => {
    const { status, output } = runSeed({}, ["--dryrun"]);

    assert.equal(status, 1);
    assert.match(output, /Opção desconhecida: --dryrun/);
    await assertNothingWritten();
  });

  it("--dry-run mostra o que seria criado sem gravar nada", async () => {
    const { status, output } = runSeed({}, ["--dry-run"]);

    assert.equal(status, 0, output);
    assert.match(output, /Empresa "Santerra": criada\./);
    assert.match(output, /Usuário admin@santerra\.com: criado/);
    assert.match(output, /Simulação concluída: nada foi gravado\./);
    await assertNothingWritten();
  });

  it("--force libera NODE_ENV=development", async () => {
    const { status, output } = runSeed({ NODE_ENV: "development" }, ["--force", "--dry-run"]);

    assert.equal(status, 0, output);
    await assertNothingWritten();
  });

  it("primeira execução cria a empresa, o admin e os cargos", async () => {
    const { status, output } = runSeed();

    assert.equal(status, 0, output);

    const state = await readState();

    assert.deepEqual(state.companies, [{ name: "Santerra", description: null }]);
    assert.equal(state.users.length, 1);

    const [{ passwordHash, ...admin }] = state.users;

    assert.deepEqual(admin, {
      name: "Santerra Admin",
      email: "admin@santerra.com",
      isPlatformAdmin: true,
      active: true,
    });
    assert.ok(await argon2.verify(passwordHash, PASSWORD));
    assert.deepEqual(state.memberships, [ADMIN_MEMBERSHIP]);
    assert.deepEqual(state.roles, expectedRoles());
    assert.deepEqual(state.roles[0], { name: "Administrador", permissions: [...ALL_PERMISSIONS].sort() });
  });

  it("segunda execução não duplica nem sobrescreve o que foi editado", async () => {
    const { prisma } = database;
    const seller = await prisma.role.findFirstOrThrow({ where: { name: "Vendedor" } });
    const walletsDelete = await prisma.permission.findUniqueOrThrow({
      where: { name: PERMISSIONS.WALLETS_DELETE },
    });

    await prisma.company.updateMany({ data: { description: "Editada pela tela" } });
    await prisma.user.updateMany({ data: { name: "Admin renomeado" } });
    await prisma.rolePermission.deleteMany({
      where: { roleId: seller.id, permission: { name: PERMISSIONS.PERSONS_UPDATE } },
    });
    await prisma.rolePermission.create({ data: { roleId: seller.id, permissionId: walletsDelete.id } });

    const edited = await readState();
    const { status, output } = runSeed({ SEED_ADMIN_PASSWORD: OTHER_PASSWORD });

    assert.equal(status, 0, output);
    assert.match(output, /Empresa "Santerra": já existia\./);
    assert.match(output, /Usuário admin@santerra\.com: já existia/);
    assert.match(
      output,
      /Cargo "Vendedor": já existia, permissões atualizadas \(adicionadas: persons\.update; removidas: wallets\.delete\)/,
    );

    const state = await readState();

    assert.deepEqual(state.companies, [{ name: "Santerra", description: "Editada pela tela" }]);
    assert.deepEqual(state.users, edited.users);
    assert.equal(state.users[0].name, "Admin renomeado");
    assert.deepEqual(state.memberships, [ADMIN_MEMBERSHIP]);
    assert.deepEqual(state.roles, expectedRoles());
  });

  it("desfaz tudo quando a verificação final falha", async () => {
    const { prisma } = database;
    const finance = await prisma.role.findFirstOrThrow({ where: { name: "Financeiro" } });

    await prisma.user.updateMany({ data: { active: false } });
    await prisma.rolePermission.deleteMany({
      where: { roleId: finance.id, permission: { name: PERMISSIONS.FILES_UPDATE } },
    });

    const edited = await readState();
    const { status, output } = runSeed();

    assert.equal(status, 1);
    assert.match(output, /A verificação final falhou/);
    assert.match(output, /O usuário admin@santerra\.com está inativo/);
    assert.match(output, /Nada foi gravado\./);
    assert.deepEqual(await readState(), edited);
  });

  it("falha com erro claro quando falta uma permissão no banco", async () => {
    await database.prisma.permission.delete({ where: { name: PERMISSIONS.GROUPS_DELETE } });

    const { status, output } = runSeed();

    assert.equal(status, 1);
    assert.match(output, /Permissões que não existem no banco: groups\.delete\./);
  });
});

describe("saída da seed:main", () => {
  it("esconde a senha e o hash nas mensagens de erro inesperado", () => {
    const hash = "$argon2id$v=19$m=65536,t=3,p=4$c2FsdHNhbHQ$aGFzaGhhc2g";
    const error = new Error(`\n{ passwordHash: "${hash}", note: "${PASSWORD}" }`);

    assert.equal(
      describeError(error, PASSWORD),
      'Erro inesperado: { passwordHash: "[hash omitido]", note: "[senha omitida]" }',
    );
  });
});
