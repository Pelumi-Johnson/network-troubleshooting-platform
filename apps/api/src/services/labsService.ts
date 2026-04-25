import fs from "fs";
import path from "path";

export interface LabSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
}

class LabsService {
  private labsDirectory = path.join(__dirname, "..", "labs");

  getAllLabs(): LabSummary[] {
    const files = fs.readdirSync(this.labsDirectory);

    const labs = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(this.labsDirectory, file);
        const fileContents = fs.readFileSync(filePath, "utf-8");
        const lab = JSON.parse(fileContents);

        return {
          id: lab.id,
          slug: lab.slug,
          title: lab.title,
          difficulty: lab.difficulty,
          category: lab.category,
          estimatedMinutes: lab.estimatedMinutes
        };
      });

    return labs;
  }

  getLabBySlug(slug: string) {
    const files = fs.readdirSync(this.labsDirectory);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(this.labsDirectory, file);
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const lab = JSON.parse(fileContents);

      if (lab.slug === slug) {
        return lab;
      }
    }

    return null;
  }

  getLabById(id: string) {
    const files = fs.readdirSync(this.labsDirectory);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filePath = path.join(this.labsDirectory, file);
      const fileContents = fs.readFileSync(filePath, "utf-8");
      const lab = JSON.parse(fileContents);

      if (lab.id === id) {
        return lab;
      }
    }

    return null;
  }
}

export const labsService = new LabsService();