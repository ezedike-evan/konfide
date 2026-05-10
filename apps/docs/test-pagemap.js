import { getPageMap } from 'nextra/page-map'
import { getRouteToFilepath } from 'nextra/server'
console.log(await getPageMap())
console.log(await getRouteToFilepath(''))
