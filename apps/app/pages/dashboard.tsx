import React from "react";
import {
  NextPage,
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { getSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { useAccount } from "wagmi";
import { Modal } from "../components/Modal";
import PageTitle from "../components/PageTitle";
import { Truncate } from "../components/Truncate";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });
  const address = token?.sub ?? null;
  // If you have a value for "address" here, your
  // server knows the user is authenticated.
  // You can then pass any data you want
  // to the page component here.

  if (!address && !session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      address,
      session,
    },
  };
};

type AuthenticatedPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Dashboard: NextPage = ({ address }: AuthenticatedPageProps) => {
  const { t } = useTranslation("common");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { isConnected } = useAccount();

  const pageTitle = `${t("my-dashboard")}: ${address && Truncate(address)}`;
  const browserTitle = `${pageTitle} | ETS`;

  return (
    <div className="max-w-7xl mx-auto mt-12">
      <Head>
        <title>{browserTitle}</title>
      </Head>

      <PageTitle title={pageTitle} />

      <div className="grid gap-6 mx-auto mt-8 lg:mb-12 mb-6 lg:gap-12 md:space-y-0 md:grid sm:w-full md:grid-cols-2">
        <div className="grid content-start w-full gap-6 mx-auto lg:gap-12">
          <div>
            <div>
              <h2 className="text-2xl font-bold text-slate-700">My Relayer</h2>
              <div>
                <Modal>
                  <div>Gonna put an component in here.</div>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
/**  address ? (
    <h1>Authenticated as {address}</h1>
  ) : (
    <h1>Unauthenticated</h1>
  ); */
