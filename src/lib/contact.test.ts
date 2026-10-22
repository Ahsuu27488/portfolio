import { describe, it, expect } from "vitest";
import {
  contactMode,
  validate,
  web3formsPayload,
  mailtoFor,
  hireLinks,
  type ContactFields,
} from "./contact";

describe("contactMode", () => {
  it("returns mailto for undefined, empty, or whitespace strings", () => {
    expect(contactMode(undefined)).toBe("mailto");
    expect(contactMode("")).toBe("mailto");
    expect(contactMode("   ")).toBe("mailto");
  });

  it("returns web3forms for non-empty string", () => {
    expect(contactMode("abc")).toBe("web3forms");
  });
});

describe("validate", () => {
  const valid: ContactFields = {
    name: "Jane Doe",
    email: "jane@example.com",
    message: "I need a booking website for my salon.",
    botcheck: false,
  };

  it("returns null for a valid set of fields", () => {
    expect(validate(valid)).toBeNull();
  });

  it("returns an error message when name is missing or whitespace", () => {
    expect(validate({ ...valid, name: "" })).toBe("Please add your name.");
    expect(validate({ ...valid, name: "   " })).toBe("Please add your name.");
  });

  it("returns an error message when email is missing or invalid", () => {
    expect(validate({ ...valid, email: "" })).toBe("Please check your email address.");
    expect(validate({ ...valid, email: "   " })).toBe("Please check your email address.");
    expect(validate({ ...valid, email: "notanemail" })).toBe("Please check your email address.");
    expect(validate({ ...valid, email: "jane@" })).toBe("Please check your email address.");
    expect(validate({ ...valid, email: "jane@example" })).toBe("Please check your email address.");
    expect(validate({ ...valid, email: "@example.com" })).toBe("Please check your email address.");
  });

  it("returns an error message when message is missing or less than 10 characters", () => {
    expect(validate({ ...valid, message: "" })).toBe("Please write a few words about your project.");
    expect(validate({ ...valid, message: "   " })).toBe("Please write a few words about your project.");
    expect(validate({ ...valid, message: "Short" })).toBe("Please write a few words about your project.");
  });
});

describe("web3formsPayload", () => {
  it("includes access_key, trimmed fields, and botcheck", () => {
    const fields: ContactFields = {
      name: "  Jane Doe  ",
      email: "  jane@example.com  ",
      message: "  I need a booking website for my salon.  ",
      botcheck: false,
    };
    const payload = web3formsPayload(fields, "test-access-key");
    expect(payload).toEqual({
      access_key: "test-access-key",
      subject: "A project for Ahsan from Jane Doe",
      from_name: "ahsandev.site",
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I need a booking website for my salon.",
      botcheck: false,
    });
  });

  it("preserves botcheck boolean when true", () => {
    const fields: ContactFields = {
      name: "Spam Bot",
      email: "bot@example.com",
      message: "This is a spam message 123456",
      botcheck: true,
    };
    const payload = web3formsPayload(fields, "test-key");
    expect(payload.botcheck).toBe(true);
  });
});

describe("mailtoFor", () => {
  it("starts with mailto:ahsanraj2748@gmail.com?subject= and contains the encoded message", () => {
    const fields: ContactFields = {
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I need a booking website for my salon.",
      botcheck: false,
    };
    const link = mailtoFor(fields);
    expect(link.startsWith("mailto:ahsanraj2748@gmail.com?subject=")).toBe(true);
    expect(link).toContain(encodeURIComponent("A project for Ahsan"));
    expect(link).toContain(encodeURIComponent("I need a booking website for my salon."));
    expect(link).toContain(encodeURIComponent("Jane Doe"));
    expect(link).toContain(encodeURIComponent("jane@example.com"));
  });

  it("uses fallback text when all fields are empty", () => {
    const emptyFields: ContactFields = {
      name: "",
      email: "",
      message: "",
      botcheck: false,
    };
    const link = mailtoFor(emptyFields);
    expect(link.startsWith("mailto:ahsanraj2748@gmail.com?subject=")).toBe(true);
    expect(link).toContain(encodeURIComponent("Hi Ahsan,\n\n"));
  });
});

describe("hireLinks", () => {
  it("returns [] when both are empty", () => {
    expect(hireLinks({ fiverr: "", upwork: "" })).toEqual([]);
  });

  it("returns [] when values are whitespace", () => {
    expect(hireLinks({ fiverr: "   ", upwork: "   " })).toEqual([]);
  });

  it("returns one Upwork link when only upwork is set", () => {
    expect(hireLinks({ fiverr: "", upwork: "https://upwork.com/freelancers/~ahsan" })).toEqual([
      { label: "Hire me on Upwork", href: "https://upwork.com/freelancers/~ahsan" },
    ]);
  });

  it("returns Fiverr then Upwork when both are set", () => {
    expect(
      hireLinks({
        fiverr: "https://fiverr.com/ahsan",
        upwork: "https://upwork.com/freelancers/~ahsan",
      })
    ).toEqual([
      { label: "Hire me on Fiverr", href: "https://fiverr.com/ahsan" },
      { label: "Hire me on Upwork", href: "https://upwork.com/freelancers/~ahsan" },
    ]);
  });
});
