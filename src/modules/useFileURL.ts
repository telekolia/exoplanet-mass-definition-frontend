import { useEffect, useState } from 'react'

export function useFileURL(file: File | null) {
  const [url, setURL] = useState('')
  useEffect(() => {
    if (!file) { setURL(''); return }
    const nextURL = URL.createObjectURL(file)
    setURL(nextURL)
    return () => URL.revokeObjectURL(nextURL)
  }, [file])
  return url
}
