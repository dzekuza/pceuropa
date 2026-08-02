import { describe, expect, it, vi, beforeEach } from "vitest";

const { getRole } = vi.hoisted(() => ({ getRole: vi.fn() }));
vi.mock("@/lib/auth/get-role", () => ({ getRole }));

const { onConflictDoUpdate, values, insert } = vi.hoisted(() => {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn(() => ({ onConflictDoUpdate }));
  const insert = vi.fn(() => ({ values }));
  return { onConflictDoUpdate, values, insert };
});
vi.mock("@/lib/db", () => ({ db: { insert } }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { savePageContent } = await import("./pages");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("savePageContent", () => {
  it("rejects the update when the caller is not admin", async () => {
    getRole.mockResolvedValue("seller");

    const result = await savePageContent("landing", [
      { section_key: "hero", content_key: "title", value: "PC Europa" },
    ]);

    expect(result).toEqual({ error: "Neturite teisės atlikti šį veiksmą" });
  });

  it("does not write to the database when the caller is not admin", async () => {
    getRole.mockResolvedValue("seller");

    await savePageContent("landing", [
      { section_key: "hero", content_key: "title", value: "PC Europa" },
    ]);

    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects an unknown page_slug", async () => {
    getRole.mockResolvedValue("admin");

    const result = await savePageContent("not-a-real-page", [
      { section_key: "hero", content_key: "title", value: "PC Europa" },
    ]);

    expect(result).toEqual({ error: "Neteisingi puslapio turinio duomenys" });
  });

  it("rejects a section_key/content_key pair not defined on the page config", async () => {
    getRole.mockResolvedValue("admin");

    const result = await savePageContent("landing", [
      { section_key: "hero", content_key: "not_a_real_field", value: "x" },
    ]);

    expect(result).toEqual({ error: "Neteisingi puslapio turinio duomenys" });
  });

  it("rejects a value longer than the length cap", async () => {
    getRole.mockResolvedValue("admin");

    const result = await savePageContent("landing", [
      { section_key: "hero", content_key: "title", value: "a".repeat(10_001) },
    ]);

    expect(result).toEqual({ error: "Neteisingi puslapio turinio duomenys" });
  });

  it("upserts valid content and returns success", async () => {
    getRole.mockResolvedValue("admin");

    const result = await savePageContent("landing", [
      { section_key: "hero", content_key: "title", value: "PC Europa" },
    ]);

    expect(result).toEqual({ success: true });
  });

  it("passes the correct row shape to the database insert", async () => {
    getRole.mockResolvedValue("admin");

    await savePageContent("landing", [
      { section_key: "hero", content_key: "title", value: "PC Europa" },
    ]);

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        pageSlug: "landing",
        sectionKey: "hero",
        contentKey: "title",
        value: "PC Europa",
      }),
    );
  });
});
