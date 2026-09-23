import { CITIES, SERVICE_CATEGORIES } from './seoCities'
import { getCityCategoryDeep } from './seoCityCategoryContent'

/** One indexability rule for static routes and React directory navigation. */
export const shouldIndexCityService = (citySlug: string, serviceSlug: string): boolean =>
  CITIES.some(city => city.slug === citySlug)
  && SERVICE_CATEGORIES.some(service => service.slug === serviceSlug)
  && Boolean(getCityCategoryDeep(citySlug, serviceSlug))
