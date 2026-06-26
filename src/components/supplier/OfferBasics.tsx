import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type OfferBasicsValue = {
  title: string
  description: string
  price: string
  delivery_weeks: string
}

type Props = {
  value: OfferBasicsValue
  onChange: (next: OfferBasicsValue) => void
}

const OfferBasics = ({ value, onChange }: Props) => (
  <div className="space-y-4">
    <div><Label htmlFor="offer-title">Offert-titel *</Label><Input id="offer-title" value={value.title} onChange={event => onChange({ ...value, title: event.target.value })} required /></div>
    <div><Label htmlFor="offer-description">Beskrivning *</Label><Textarea id="offer-description" value={value.description} onChange={event => onChange({ ...value, description: event.target.value })} className="min-h-[120px]" required /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><Label htmlFor="offer-price">Pris (kr) *</Label><Input id="offer-price" type="number" min="1" value={value.price} onChange={event => onChange({ ...value, price: event.target.value })} required /></div>
      <div><Label htmlFor="offer-weeks">Leveranstid (veckor)</Label><Input id="offer-weeks" type="number" min="1" value={value.delivery_weeks} onChange={event => onChange({ ...value, delivery_weeks: event.target.value })} /></div>
    </div>
  </div>
)

export default OfferBasics
