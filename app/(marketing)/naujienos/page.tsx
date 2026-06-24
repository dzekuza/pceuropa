import { redirect } from 'next/navigation'

// /naujienos and /akcijos share the same content — canonical URL is /akcijos
export default function NaujienosPage() {
  redirect('/akcijos')
}
