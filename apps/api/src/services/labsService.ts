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

  private getLabFiles() {
    return fs
      .readdirSync(this.labsDirectory)
      .filter((file) => file.endsWith(".json"))
      .sort();
  }

  private readLabFile(file: string) {
    const filePath = path.join(this.labsDirectory, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");

    return JSON.parse(fileContents);
  }

  getAllLabs(): LabSummary[] {
    const files = this.getLabFiles();

    return files.map((file) => {
      const lab = this.readLabFile(file);

      return {
        id: lab.id,
        slug: lab.slug,
        title: lab.title,
        difficulty: lab.difficulty,
        category: lab.category,
        estimatedMinutes: lab.estimatedMinutes,
      };
    });
  }

  getLabBySlug(slug: string) {
    const files = this.getLabFiles();

    for (const file of files) {
      const lab = this.readLabFile(file);

      if (lab.slug === slug) {
        return lab;
      }
    }

    return null;
  }

  getLabById(id: string) {
    const files = this.getLabFiles();

    for (const file of files) {
      const lab = this.readLabFile(file);

      if (lab.id === id) {
        return lab;
      }
    }

    return null;
  }
}

export const labsService = new LabsService();