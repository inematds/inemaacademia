import { describe, expect, it } from "vitest";
import { diasEntre, formataDataBR, hojeBR } from "@/lib/dates";

describe("datas em Brasilia", () => {
  it("23h30 em Brasilia ainda e o mesmo dia (UTC ja virou)", () => {
    expect(hojeBR(new Date("2026-10-20T02:30:00Z"))).toBe("2026-10-19");
  });
  it("conta dias entre datas AAAA-MM-DD", () => {
    expect(diasEntre("2026-10-18", "2026-10-19")).toBe(1);
    expect(diasEntre("2026-02-28", "2026-03-01")).toBe(1);
    expect(diasEntre("2026-10-19", "2026-10-19")).toBe(0);
  });
  it("formata DATE sem voltar um dia", () => {
    expect(formataDataBR("2026-10-19")).toBe("19/10/2026");
    expect(formataDataBR(null)).toBe("");
  });
});
