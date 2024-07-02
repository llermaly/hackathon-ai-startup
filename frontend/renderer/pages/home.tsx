import type { NextPage } from "next";
import Head from "next/head";
import Sidemenu from "../components/side-menu";
import Header from "../components/header";
import SideChat from "../components/side-chat";
import Chat from "../components/chat";
import bg from "../../resources/bg.png";
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Agile Loop Hackathon</title>
        <meta name="description" content="Agile Loop Hackathon" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative">
        <img
          src="images/bg.png"
          alt="bg"
          className="absolute w-screen h-screen"
        />
        <div className="absolute w-full p-4 max-w-screen ">
          <div className="w-full px-4 pb-6 mx-auto bg-white rounded-md bg-opacity-40">
            <Header />

            <div className="flex h-[450px]">
              <div className="flex-1 w-full h-full bg-white rounded-md shadow">
                <div className="flex flex-col w-full h-full p-4 m-auto main-body">
                  <div className="flex flex-col flex-1 main">
                    <div className="flex flex-1 h-full">
                      <Chat />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
