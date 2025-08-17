import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'replit-qa-app-secret-key-for-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local authentication strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email: string, password: string, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Account is disabled' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login route
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ 
      user: {
        id: (req.user as any).id,
        email: (req.user as any).email,
        firstName: (req.user as any).firstName,
        lastName: (req.user as any).lastName,
        role: (req.user as any).role
      }
    });
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

export const requireRole = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

export const requireAdmin: RequestHandler = requireRole(['admin']);
export const requireSupervisorOrAdmin: RequestHandler = requireRole(['supervisor', 'admin']);
export const requireAnyRole: RequestHandler = requireRole(['user', 'supervisor', 'admin']);