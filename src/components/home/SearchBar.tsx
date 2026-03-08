import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants'

const SearchBar = () => {
  return (
    <div className="container relative z-20 -mt-8">
      <div className="bg-card rounded-2xl shadow-lg border p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-3">
          <Select>
            <SelectTrigger className="md:flex-1 rounded-xl">
              <SelectValue placeholder="Välj kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Stad (t.ex. Stockholm)"
            className="md:flex-1 rounded-xl"
          />

          <Link to="/byraer">
            <Button className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue-hover text-primary-foreground rounded-xl px-6">
              <Search className="mr-2 h-4 w-4" />
              Hitta byråer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SearchBar
