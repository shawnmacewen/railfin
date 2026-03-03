import { readFile } from "node:fs/promises";
import path from "node:path";

import { Card } from "../../../../ui/primitives";

type ChangeLogSection = {
  heading: string;
  items: string[];
};

function parseChangeLog(markdown: string): ChangeLogSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: ChangeLogSection[] = [];
  let current: ChangeLogSection | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) {
        sections.push(current);
      }
      current = { heading: line.replace(/^##\s+/, "").trim(), items: [] };
      continue;
    }

    if (line.startsWith("- ") && current) {
      current.items.push(line.replace(/^-\s+/, "").trim());
    }
  }

  if (current) {
    sections.push(current);
  }

  return sections;
}

async function loadChangeLog() {
  const filePath = path.join(process.cwd(), "docs", "CHANGELOG.md");
  const markdown = await readFile(filePath, "utf8");
  return parseChangeLog(markdown);
}

export default async function ConfigureChangeLogPage() {
  const sections = await loadChangeLog();

  return (
    <Card>
      <h3 className="rf-configure-section-title">Change Log</h3>
      <p className="rf-status rf-status-muted">
        Human-readable release highlights for operators and stakeholders.
      </p>

      <div className="rf-changelog-list">
        {sections.map((section) => (
          <section key={section.heading} className="rf-changelog-section">
            <h4>{section.heading}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  );
}
