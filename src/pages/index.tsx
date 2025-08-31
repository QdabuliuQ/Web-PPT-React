import { memo } from "react"
import { Header } from "./Header"
import { Menu } from "./Menu"

function Index() {
  return (
    <div className="w-[100vw] h-[100vh] bg-[#eee]">
      <Header />
      <Menu />
    </div>
  )
}

export default memo(Index)