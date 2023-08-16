import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";

export const getServerSideProps = async (context) => {
  const session = await getSession(context.req, context.res);

  if (session) {
    return {
      redirect: {
        destination: "/chat",
      },
    };
  }

  return {
    props: {},
  };
};

export default function Home() {
  const { error, isLoading, user } = useUser();

  return (
    <>
      <Head>
        <title>AI Pal</title>
      </Head>
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-800 text-center text-white">
        <div>
          {user && <Link href="/api/auth/logout">Logout</Link>}
          {!user && (
            <>
              <Link
                href="/api/auth/login"
                className="btn"
              >
                Login
              </Link>
              <Link
                href="/api/auth/signup"
                className="btn"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
