/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ReservarIndexImport } from './routes/reservar/index'
import { Route as PublicarviajeIndexImport } from './routes/publicarviaje/index'
import { Route as PerfilIndexImport } from './routes/perfil/index'
import { Route as HomeIndexImport } from './routes/home/index'
import { Route as AccountIndexImport } from './routes/account/index'
import { Route as RegistroIndexImport } from './routes/Registro/index'
import { Route as RegistrarVehiculoIndexImport } from './routes/RegistrarVehiculo/index'
import { Route as RegistrarDatosIndexImport } from './routes/RegistrarDatos/index'
import { Route as RecuperarPaswordIndexImport } from './routes/RecuperarPasword/index'
import { Route as OrigenIndexImport } from './routes/Origen/index'
import { Route as LoginIndexImport } from './routes/Login/index'
import { Route as DestinoIndexImport } from './routes/Destino/index'
import { Route as DateSelectedIndexImport } from './routes/DateSelected/index'
import { Route as RegistrarVehiculoDocumentosImport } from './routes/RegistrarVehiculo/Documentos'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const IndexLazyRoute = IndexLazyImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ReservarIndexRoute = ReservarIndexImport.update({
  path: '/reservar/',
  getParentRoute: () => rootRoute,
} as any)

const PublicarviajeIndexRoute = PublicarviajeIndexImport.update({
  path: '/publicarviaje/',
  getParentRoute: () => rootRoute,
} as any)

const PerfilIndexRoute = PerfilIndexImport.update({
  path: '/perfil/',
  getParentRoute: () => rootRoute,
} as any)

const HomeIndexRoute = HomeIndexImport.update({
  path: '/home/',
  getParentRoute: () => rootRoute,
} as any)

const AccountIndexRoute = AccountIndexImport.update({
  path: '/account/',
  getParentRoute: () => rootRoute,
} as any)

const RegistroIndexRoute = RegistroIndexImport.update({
  path: '/Registro/',
  getParentRoute: () => rootRoute,
} as any)

const RegistrarVehiculoIndexRoute = RegistrarVehiculoIndexImport.update({
  path: '/RegistrarVehiculo/',
  getParentRoute: () => rootRoute,
} as any)

const RegistrarDatosIndexRoute = RegistrarDatosIndexImport.update({
  path: '/RegistrarDatos/',
  getParentRoute: () => rootRoute,
} as any)

const RecuperarPaswordIndexRoute = RecuperarPaswordIndexImport.update({
  path: '/RecuperarPasword/',
  getParentRoute: () => rootRoute,
} as any)

const OrigenIndexRoute = OrigenIndexImport.update({
  path: '/Origen/',
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexRoute = LoginIndexImport.update({
  path: '/Login/',
  getParentRoute: () => rootRoute,
} as any)

const DestinoIndexRoute = DestinoIndexImport.update({
  path: '/Destino/',
  getParentRoute: () => rootRoute,
} as any)

const DateSelectedIndexRoute = DateSelectedIndexImport.update({
  path: '/DateSelected/',
  getParentRoute: () => rootRoute,
} as any)

const RegistrarVehiculoDocumentosRoute =
  RegistrarVehiculoDocumentosImport.update({
    path: '/RegistrarVehiculo/Documentos',
    getParentRoute: () => rootRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/Documentos': {
      id: '/RegistrarVehiculo/Documentos'
      path: '/RegistrarVehiculo/Documentos'
      fullPath: '/RegistrarVehiculo/Documentos'
      preLoaderRoute: typeof RegistrarVehiculoDocumentosImport
      parentRoute: typeof rootRoute
    }
    '/DateSelected/': {
      id: '/DateSelected/'
      path: '/DateSelected'
      fullPath: '/DateSelected'
      preLoaderRoute: typeof DateSelectedIndexImport
      parentRoute: typeof rootRoute
    }
    '/Destino/': {
      id: '/Destino/'
      path: '/Destino'
      fullPath: '/Destino'
      preLoaderRoute: typeof DestinoIndexImport
      parentRoute: typeof rootRoute
    }
    '/Login/': {
      id: '/Login/'
      path: '/Login'
      fullPath: '/Login'
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
    '/Origen/': {
      id: '/Origen/'
      path: '/Origen'
      fullPath: '/Origen'
      preLoaderRoute: typeof OrigenIndexImport
      parentRoute: typeof rootRoute
    }
    '/RecuperarPasword/': {
      id: '/RecuperarPasword/'
      path: '/RecuperarPasword'
      fullPath: '/RecuperarPasword'
      preLoaderRoute: typeof RecuperarPaswordIndexImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarDatos/': {
      id: '/RegistrarDatos/'
      path: '/RegistrarDatos'
      fullPath: '/RegistrarDatos'
      preLoaderRoute: typeof RegistrarDatosIndexImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/': {
      id: '/RegistrarVehiculo/'
      path: '/RegistrarVehiculo'
      fullPath: '/RegistrarVehiculo'
      preLoaderRoute: typeof RegistrarVehiculoIndexImport
      parentRoute: typeof rootRoute
    }
    '/Registro/': {
      id: '/Registro/'
      path: '/Registro'
      fullPath: '/Registro'
      preLoaderRoute: typeof RegistroIndexImport
      parentRoute: typeof rootRoute
    }
    '/account/': {
      id: '/account/'
      path: '/account'
      fullPath: '/account'
      preLoaderRoute: typeof AccountIndexImport
      parentRoute: typeof rootRoute
    }
    '/home/': {
      id: '/home/'
      path: '/home'
      fullPath: '/home'
      preLoaderRoute: typeof HomeIndexImport
      parentRoute: typeof rootRoute
    }
    '/perfil/': {
      id: '/perfil/'
      path: '/perfil'
      fullPath: '/perfil'
      preLoaderRoute: typeof PerfilIndexImport
      parentRoute: typeof rootRoute
    }
    '/publicarviaje/': {
      id: '/publicarviaje/'
      path: '/publicarviaje'
      fullPath: '/publicarviaje'
      preLoaderRoute: typeof PublicarviajeIndexImport
      parentRoute: typeof rootRoute
    }
    '/reservar/': {
      id: '/reservar/'
      path: '/reservar'
      fullPath: '/reservar'
      preLoaderRoute: typeof ReservarIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/RegistrarVehiculo/Documentos': typeof RegistrarVehiculoDocumentosRoute
  '/DateSelected': typeof DateSelectedIndexRoute
  '/Destino': typeof DestinoIndexRoute
  '/Login': typeof LoginIndexRoute
  '/Origen': typeof OrigenIndexRoute
  '/RecuperarPasword': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo': typeof RegistrarVehiculoIndexRoute
  '/Registro': typeof RegistroIndexRoute
  '/account': typeof AccountIndexRoute
  '/home': typeof HomeIndexRoute
  '/perfil': typeof PerfilIndexRoute
  '/publicarviaje': typeof PublicarviajeIndexRoute
  '/reservar': typeof ReservarIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/RegistrarVehiculo/Documentos': typeof RegistrarVehiculoDocumentosRoute
  '/DateSelected': typeof DateSelectedIndexRoute
  '/Destino': typeof DestinoIndexRoute
  '/Login': typeof LoginIndexRoute
  '/Origen': typeof OrigenIndexRoute
  '/RecuperarPasword': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo': typeof RegistrarVehiculoIndexRoute
  '/Registro': typeof RegistroIndexRoute
  '/account': typeof AccountIndexRoute
  '/home': typeof HomeIndexRoute
  '/perfil': typeof PerfilIndexRoute
  '/publicarviaje': typeof PublicarviajeIndexRoute
  '/reservar': typeof ReservarIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/RegistrarVehiculo/Documentos': typeof RegistrarVehiculoDocumentosRoute
  '/DateSelected/': typeof DateSelectedIndexRoute
  '/Destino/': typeof DestinoIndexRoute
  '/Login/': typeof LoginIndexRoute
  '/Origen/': typeof OrigenIndexRoute
  '/RecuperarPasword/': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos/': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo/': typeof RegistrarVehiculoIndexRoute
  '/Registro/': typeof RegistroIndexRoute
  '/account/': typeof AccountIndexRoute
  '/home/': typeof HomeIndexRoute
  '/perfil/': typeof PerfilIndexRoute
  '/publicarviaje/': typeof PublicarviajeIndexRoute
  '/reservar/': typeof ReservarIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/RegistrarVehiculo/Documentos'
    | '/DateSelected'
    | '/Destino'
    | '/Login'
    | '/Origen'
    | '/RecuperarPasword'
    | '/RegistrarDatos'
    | '/RegistrarVehiculo'
    | '/Registro'
    | '/account'
    | '/home'
    | '/perfil'
    | '/publicarviaje'
    | '/reservar'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/RegistrarVehiculo/Documentos'
    | '/DateSelected'
    | '/Destino'
    | '/Login'
    | '/Origen'
    | '/RecuperarPasword'
    | '/RegistrarDatos'
    | '/RegistrarVehiculo'
    | '/Registro'
    | '/account'
    | '/home'
    | '/perfil'
    | '/publicarviaje'
    | '/reservar'
  id:
    | '__root__'
    | '/'
    | '/RegistrarVehiculo/Documentos'
    | '/DateSelected/'
    | '/Destino/'
    | '/Login/'
    | '/Origen/'
    | '/RecuperarPasword/'
    | '/RegistrarDatos/'
    | '/RegistrarVehiculo/'
    | '/Registro/'
    | '/account/'
    | '/home/'
    | '/perfil/'
    | '/publicarviaje/'
    | '/reservar/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  RegistrarVehiculoDocumentosRoute: typeof RegistrarVehiculoDocumentosRoute
  DateSelectedIndexRoute: typeof DateSelectedIndexRoute
  DestinoIndexRoute: typeof DestinoIndexRoute
  LoginIndexRoute: typeof LoginIndexRoute
  OrigenIndexRoute: typeof OrigenIndexRoute
  RecuperarPaswordIndexRoute: typeof RecuperarPaswordIndexRoute
  RegistrarDatosIndexRoute: typeof RegistrarDatosIndexRoute
  RegistrarVehiculoIndexRoute: typeof RegistrarVehiculoIndexRoute
  RegistroIndexRoute: typeof RegistroIndexRoute
  AccountIndexRoute: typeof AccountIndexRoute
  HomeIndexRoute: typeof HomeIndexRoute
  PerfilIndexRoute: typeof PerfilIndexRoute
  PublicarviajeIndexRoute: typeof PublicarviajeIndexRoute
  ReservarIndexRoute: typeof ReservarIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  RegistrarVehiculoDocumentosRoute: RegistrarVehiculoDocumentosRoute,
  DateSelectedIndexRoute: DateSelectedIndexRoute,
  DestinoIndexRoute: DestinoIndexRoute,
  LoginIndexRoute: LoginIndexRoute,
  OrigenIndexRoute: OrigenIndexRoute,
  RecuperarPaswordIndexRoute: RecuperarPaswordIndexRoute,
  RegistrarDatosIndexRoute: RegistrarDatosIndexRoute,
  RegistrarVehiculoIndexRoute: RegistrarVehiculoIndexRoute,
  RegistroIndexRoute: RegistroIndexRoute,
  AccountIndexRoute: AccountIndexRoute,
  HomeIndexRoute: HomeIndexRoute,
  PerfilIndexRoute: PerfilIndexRoute,
  PublicarviajeIndexRoute: PublicarviajeIndexRoute,
  ReservarIndexRoute: ReservarIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/RegistrarVehiculo/Documentos",
        "/DateSelected/",
        "/Destino/",
        "/Login/",
        "/Origen/",
        "/RecuperarPasword/",
        "/RegistrarDatos/",
        "/RegistrarVehiculo/",
        "/Registro/",
        "/account/",
        "/home/",
        "/perfil/",
        "/publicarviaje/",
        "/reservar/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/RegistrarVehiculo/Documentos": {
      "filePath": "RegistrarVehiculo/Documentos.tsx"
    },
    "/DateSelected/": {
      "filePath": "DateSelected/index.tsx"
    },
    "/Destino/": {
      "filePath": "Destino/index.tsx"
    },
    "/Login/": {
      "filePath": "Login/index.tsx"
    },
    "/Origen/": {
      "filePath": "Origen/index.tsx"
    },
    "/RecuperarPasword/": {
      "filePath": "RecuperarPasword/index.tsx"
    },
    "/RegistrarDatos/": {
      "filePath": "RegistrarDatos/index.tsx"
    },
    "/RegistrarVehiculo/": {
      "filePath": "RegistrarVehiculo/index.tsx"
    },
    "/Registro/": {
      "filePath": "Registro/index.tsx"
    },
    "/account/": {
      "filePath": "account/index.tsx"
    },
    "/home/": {
      "filePath": "home/index.tsx"
    },
    "/perfil/": {
      "filePath": "perfil/index.tsx"
    },
    "/publicarviaje/": {
      "filePath": "publicarviaje/index.tsx"
    },
    "/reservar/": {
      "filePath": "reservar/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
