// Importez la bibliothèque jsonwebtoken
import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("Google Account:", account); // Vérifie l’authentification de Google

      if (account) {
        token.id = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
        token.userRole = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      // Générez un token JWT personnalisé
      console.log("Session JWT Token:", token); // Vérifie le token JWT personnalisé

      const jwtToken = jwt.sign(
        {
          id: token.id,
          email: token.email,
          name: token.name,
          userRole: token.userRole,
        },
        process.env.NEXTAUTH_SECRET,
        { expiresIn: '1h' }
      );
      session.jwtToken = jwtToken; // Incluez le token JWT dans la session
      console.log("jwtToken:", jwtToken);
      return session;
    },
    async redirect({ url, baseUrl }) {
      return 'http://localhost:3000/dashboard';
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };