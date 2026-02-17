import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/signin", // 👈 forces NextAuth to use your custom login page
  },

  callbacks: {
    async signIn({ user }) {
      // allow Google login — your allowlist gating happens AFTER login
      return !!user?.email;
    },
  },
});

export { handler as GET, handler as POST };
