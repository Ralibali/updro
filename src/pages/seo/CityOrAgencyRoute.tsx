import { Navigate, useParams } from 'react-router-dom'
import { CITIES } from '@/lib/seoCities'
import AgencyCityPage from './AgencyCityPage'

/**
 * /byraer/:stad is either a city page or a legacy agency URL. Lives in its own
 * lazy chunk so the city list is not part of the main bundle.
 */
const CityOrAgencyRoute = () => {
  const { stad } = useParams<{ stad: string }>()
  if (CITIES.some(city => city.slug === stad)) return <AgencyCityPage />
  return <Navigate to={`/byra/${stad}`} replace />
}

export default CityOrAgencyRoute
