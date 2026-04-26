import { prisma } from "../db/prisma";

const DEMO_USER_EMAIL = "demo@network-lab.local";
const DEMO_USER_NAME = "Demo User";

export type DemoUser = {
  id: string;
  email: string;
  name: string | null;
};

class IdentityService {
  async getDemoUser(): Promise<DemoUser> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: DEMO_USER_EMAIL,
      },
    });

    if (existingUser) {
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      };
    }

    const newUser = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
  }
}

export const identityService = new IdentityService();