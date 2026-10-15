import { getTranslations } from 'next-intl/server'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const FAQ_KEYS = [
  'areas',
  'timings',
  'fee',
  'deposit',
  'return',
  'minimum',
  'payment',
  'subscription',
] as const

export async function getFaqItems(keys: readonly (typeof FAQ_KEYS)[number][] = FAQ_KEYS) {
  const t = await getTranslations('faq.items')
  return keys.map((k) => ({ key: k, q: t(`${k}.q`), a: t(`${k}.a`) }))
}

export async function FaqList({
  keys = FAQ_KEYS,
}: {
  keys?: readonly (typeof FAQ_KEYS)[number][]
}) {
  const items = await getFaqItems(keys)
  return (
    <Accordion type="single" collapsible className="bg-card rounded-2xl border px-6">
      {items.map((i) => (
        <AccordionItem key={i.key} value={i.key}>
          <AccordionTrigger>{i.q}</AccordionTrigger>
          <AccordionContent>{i.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
