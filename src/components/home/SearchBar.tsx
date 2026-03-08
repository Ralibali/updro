import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="container relative z-20 -mt-6">
      <div className="bg-card rounded-2xl shadow-md border p-4 md:p-5 max-w-xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select>
            <SelectTrigger className="sm:flex-1 rounded-xl">
              <SelectValue placeholder="Välj kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link to="/byraer">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6">
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
