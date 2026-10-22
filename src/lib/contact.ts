import { mailto } from "@/content/site";

export const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export type ContactFields = {
  name: string;
  email: string;
  message: string;
  botcheck: boolean;
};

export function contactMode(key: string | undefined): "web3forms" | "mailto" {
  return key && key.trim().length > 0 ? "web3forms" : "mailto";
}

export function validate(f: ContactFields): string | null {
  if (!f.name.trim()) {
    return "Please add your name.";
  }
  const email = f.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please check your email address.";
  }
  const message = f.message.trim();
  if (!message || message.length < 10) {
    return "Please write a few words about your project.";
  }
  return null;
}

export function web3formsPayload(f: ContactFields, key: string) {
  return {
    access_key: key,
    subject: `A project for Ahsan from ${f.name.trim()}`,
    from_name: "ahsandev.site",
    name: f.name.trim(),
    email: f.email.trim(),
    message: f.message.trim(),
    botcheck: f.botcheck,
  };
}

export function mailtoFor(f: ContactFields): string {
  const message = f.message.trim();
  const name = f.name.trim();
  const email = f.email.trim();
  const sender = [name, email].filter(Boolean).join("\n");
  const body = message && sender ? `${message}\n\n${sender}` : message || sender || "Hi Ahsan,\n\n";
  return mailto("A project for Ahsan", body);
}

export function hireLinks(hire: { fiverr: string; upwork: string }): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];
  if (hire.fiverr?.trim()) {
    links.push({ label: "Hire me on Fiverr", href: hire.fiverr.trim() });
  }
  if (hire.upwork?.trim()) {
    links.push({ label: "Hire me on Upwork", href: hire.upwork.trim() });
  }
  return links;
}
