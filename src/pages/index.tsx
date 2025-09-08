import { memo } from "react";
import { Canvas } from "./Canvas";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Menu } from "./Menu";
import { Preview } from "./Preview";

function Index() {
  return (
    <div className="w-[100vw] h-[100vh] bg-[#eee] flex flex-col">
      <Header />
      <Menu />
      <div className="flex flex-1 w-[calc(100%-20px)] ml-[20px] my-[10px]">
        <Preview />
        <Canvas />
      </div>
      <Footer />
    </div>
  );
}

export default memo(Index);
