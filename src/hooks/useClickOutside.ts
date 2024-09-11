import { useEffect } from 'react'

export default function useClickOutside(
  ref: any,
  handler: (...args: Array<any>) => void
) {
  useEffect(() => {
    const listener = (event: { button: number; target: any }) => {
      if (
        event.button === 0 &&
        (!ref.current || !ref.current.contains(event.target))
      ) {
        handler(event)
      }
    }

    document.addEventListener('mousedown', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [ref, handler])
}
