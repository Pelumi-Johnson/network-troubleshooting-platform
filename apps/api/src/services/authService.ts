import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev-network-lab-secret";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

function toAuthUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

class AuthService {
  createToken(user: AuthUser) {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
  }

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash,
      },
    });

    const authUser = toAuthUser(user);
    const token = this.createToken(authUser);

    return {
      user: authUser,
      token,
    };
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new Error("Invalid email or password");
    }

    const authUser = toAuthUser(user);
    const token = this.createToken(authUser);

    return {
      user: authUser,
      token,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return toAuthUser(user);
  }

  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
    };
  }
}

export const authService = new AuthService();