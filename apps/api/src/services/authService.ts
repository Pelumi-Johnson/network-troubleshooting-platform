import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { prisma } from "../db/prisma";

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

type JwtPayload = {
  sub: string;
  email: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required. Add it to apps/api/.env");
  }

  return secret;
}

function toAuthUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

class AuthService {
  createToken(user: AuthUser) {
    const secret = getJwtSecret();

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      secret,
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

  verifyToken(token: string): JwtPayload {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}

export const authService = new AuthService();