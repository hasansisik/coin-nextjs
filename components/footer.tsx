"use client"
import { getFooterData } from "@/redux/actions/footerActions"
import { AppDispatch } from "@/redux/store"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function Footer() {
  const dispatch = useDispatch<AppDispatch>()
  const { footer } = useSelector((state: any) => state.footer)

  useEffect(() => {
    dispatch(getFooterData())
  }, [dispatch])

  return (
    <footer className="px-4 md:px-20 py-5 border-t">
      <p className="text-xs md:text-sm text-gray-500 text-center">
       {footer?.kvk.content}
      </p>
    </footer>
  );
}
