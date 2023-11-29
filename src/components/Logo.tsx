import Image from "next/image";
import logo from "@/images/logos/Full logo.png"

export function Logo(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
      <div className="w-40">
        <Image src={logo} alt={"Comend"} />
      </div>
  )
}
