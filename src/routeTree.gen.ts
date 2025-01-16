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
import { Route as ReservasIndexImport } from './routes/Reservas/index'
import { Route as RegistroIndexImport } from './routes/Registro/index'
import { Route as RegistrarVehiculoIndexImport } from './routes/RegistrarVehiculo/index'
import { Route as RegistrarDatosIndexImport } from './routes/RegistrarDatos/index'
import { Route as RecuperarPaswordIndexImport } from './routes/RecuperarPasword/index'
import { Route as ParadasIndexImport } from './routes/Paradas/index'
import { Route as PagarCupoIndexImport } from './routes/PagarCupo/index'
import { Route as OrigenIndexImport } from './routes/Origen/index'
import { Route as LoginIndexImport } from './routes/Login/index'
import { Route as DetallesViajeIndexImport } from './routes/DetallesViaje/index'
import { Route as DestinoIndexImport } from './routes/Destino/index'
import { Route as DateSelectedIndexImport } from './routes/DateSelected/index'
import { Route as CuponesIndexImport } from './routes/Cupones/index'
import { Route as ConfirmarCupoIndexImport } from './routes/ConfirmarCupo/index'
import { Route as CompletarRegistroIndexImport } from './routes/CompletarRegistro/index'
import { Route as ActividadesIndexImport } from './routes/Actividades/index'
import { Route as ReservasTripReservationModalImport } from './routes/Reservas/TripReservationModal'
import { Route as RegistrarVehiculoSoatImport } from './routes/RegistrarVehiculo/Soat'
import { Route as RegistrarVehiculoPropertyCardImport } from './routes/RegistrarVehiculo/PropertyCard'
import { Route as RegistrarVehiculoLicenseImport } from './routes/RegistrarVehiculo/License'
import { Route as RegistrarVehiculoDocumentsRequiredImport } from './routes/RegistrarVehiculo/DocumentsRequired'
import { Route as RegistrarVehiculoDocumentFormImport } from './routes/RegistrarVehiculo/DocumentForm'
import { Route as PagarCupoUpdateTripSeatsImport } from './routes/PagarCupo/updateTripSeats'
import { Route as ActividadesActividadesPageImport } from './routes/Actividades/ActividadesPage'

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

const ReservasIndexRoute = ReservasIndexImport.update({
  path: '/Reservas/',
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

const ParadasIndexRoute = ParadasIndexImport.update({
  path: '/Paradas/',
  getParentRoute: () => rootRoute,
} as any)

const PagarCupoIndexRoute = PagarCupoIndexImport.update({
  path: '/PagarCupo/',
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

const DetallesViajeIndexRoute = DetallesViajeIndexImport.update({
  path: '/DetallesViaje/',
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

const CuponesIndexRoute = CuponesIndexImport.update({
  path: '/Cupones/',
  getParentRoute: () => rootRoute,
} as any)

const ConfirmarCupoIndexRoute = ConfirmarCupoIndexImport.update({
  path: '/ConfirmarCupo/',
  getParentRoute: () => rootRoute,
} as any)

const CompletarRegistroIndexRoute = CompletarRegistroIndexImport.update({
  path: '/CompletarRegistro/',
  getParentRoute: () => rootRoute,
} as any)

const ActividadesIndexRoute = ActividadesIndexImport.update({
  path: '/Actividades/',
  getParentRoute: () => rootRoute,
} as any)

const ReservasTripReservationModalRoute =
  ReservasTripReservationModalImport.update({
    path: '/Reservas/TripReservationModal',
    getParentRoute: () => rootRoute,
  } as any)

const RegistrarVehiculoSoatRoute = RegistrarVehiculoSoatImport.update({
  path: '/RegistrarVehiculo/Soat',
  getParentRoute: () => rootRoute,
} as any)

const RegistrarVehiculoPropertyCardRoute =
  RegistrarVehiculoPropertyCardImport.update({
    path: '/RegistrarVehiculo/PropertyCard',
    getParentRoute: () => rootRoute,
  } as any)

const RegistrarVehiculoLicenseRoute = RegistrarVehiculoLicenseImport.update({
  path: '/RegistrarVehiculo/License',
  getParentRoute: () => rootRoute,
} as any)

const RegistrarVehiculoDocumentsRequiredRoute =
  RegistrarVehiculoDocumentsRequiredImport.update({
    path: '/RegistrarVehiculo/DocumentsRequired',
    getParentRoute: () => rootRoute,
  } as any)

const RegistrarVehiculoDocumentFormRoute =
  RegistrarVehiculoDocumentFormImport.update({
    path: '/RegistrarVehiculo/DocumentForm',
    getParentRoute: () => rootRoute,
  } as any)

const PagarCupoUpdateTripSeatsRoute = PagarCupoUpdateTripSeatsImport.update({
  path: '/PagarCupo/updateTripSeats',
  getParentRoute: () => rootRoute,
} as any)

const ActividadesActividadesPageRoute = ActividadesActividadesPageImport.update(
  {
    path: '/Actividades/ActividadesPage',
    getParentRoute: () => rootRoute,
  } as any,
)

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
    '/Actividades/ActividadesPage': {
      id: '/Actividades/ActividadesPage'
      path: '/Actividades/ActividadesPage'
      fullPath: '/Actividades/ActividadesPage'
      preLoaderRoute: typeof ActividadesActividadesPageImport
      parentRoute: typeof rootRoute
    }
    '/PagarCupo/updateTripSeats': {
      id: '/PagarCupo/updateTripSeats'
      path: '/PagarCupo/updateTripSeats'
      fullPath: '/PagarCupo/updateTripSeats'
      preLoaderRoute: typeof PagarCupoUpdateTripSeatsImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/DocumentForm': {
      id: '/RegistrarVehiculo/DocumentForm'
      path: '/RegistrarVehiculo/DocumentForm'
      fullPath: '/RegistrarVehiculo/DocumentForm'
      preLoaderRoute: typeof RegistrarVehiculoDocumentFormImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/DocumentsRequired': {
      id: '/RegistrarVehiculo/DocumentsRequired'
      path: '/RegistrarVehiculo/DocumentsRequired'
      fullPath: '/RegistrarVehiculo/DocumentsRequired'
      preLoaderRoute: typeof RegistrarVehiculoDocumentsRequiredImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/License': {
      id: '/RegistrarVehiculo/License'
      path: '/RegistrarVehiculo/License'
      fullPath: '/RegistrarVehiculo/License'
      preLoaderRoute: typeof RegistrarVehiculoLicenseImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/PropertyCard': {
      id: '/RegistrarVehiculo/PropertyCard'
      path: '/RegistrarVehiculo/PropertyCard'
      fullPath: '/RegistrarVehiculo/PropertyCard'
      preLoaderRoute: typeof RegistrarVehiculoPropertyCardImport
      parentRoute: typeof rootRoute
    }
    '/RegistrarVehiculo/Soat': {
      id: '/RegistrarVehiculo/Soat'
      path: '/RegistrarVehiculo/Soat'
      fullPath: '/RegistrarVehiculo/Soat'
      preLoaderRoute: typeof RegistrarVehiculoSoatImport
      parentRoute: typeof rootRoute
    }
    '/Reservas/TripReservationModal': {
      id: '/Reservas/TripReservationModal'
      path: '/Reservas/TripReservationModal'
      fullPath: '/Reservas/TripReservationModal'
      preLoaderRoute: typeof ReservasTripReservationModalImport
      parentRoute: typeof rootRoute
    }
    '/Actividades/': {
      id: '/Actividades/'
      path: '/Actividades'
      fullPath: '/Actividades'
      preLoaderRoute: typeof ActividadesIndexImport
      parentRoute: typeof rootRoute
    }
    '/CompletarRegistro/': {
      id: '/CompletarRegistro/'
      path: '/CompletarRegistro'
      fullPath: '/CompletarRegistro'
      preLoaderRoute: typeof CompletarRegistroIndexImport
      parentRoute: typeof rootRoute
    }
    '/ConfirmarCupo/': {
      id: '/ConfirmarCupo/'
      path: '/ConfirmarCupo'
      fullPath: '/ConfirmarCupo'
      preLoaderRoute: typeof ConfirmarCupoIndexImport
      parentRoute: typeof rootRoute
    }
    '/Cupones/': {
      id: '/Cupones/'
      path: '/Cupones'
      fullPath: '/Cupones'
      preLoaderRoute: typeof CuponesIndexImport
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
    '/DetallesViaje/': {
      id: '/DetallesViaje/'
      path: '/DetallesViaje'
      fullPath: '/DetallesViaje'
      preLoaderRoute: typeof DetallesViajeIndexImport
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
    '/PagarCupo/': {
      id: '/PagarCupo/'
      path: '/PagarCupo'
      fullPath: '/PagarCupo'
      preLoaderRoute: typeof PagarCupoIndexImport
      parentRoute: typeof rootRoute
    }
    '/Paradas/': {
      id: '/Paradas/'
      path: '/Paradas'
      fullPath: '/Paradas'
      preLoaderRoute: typeof ParadasIndexImport
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
    '/Reservas/': {
      id: '/Reservas/'
      path: '/Reservas'
      fullPath: '/Reservas'
      preLoaderRoute: typeof ReservasIndexImport
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
  '/Actividades/ActividadesPage': typeof ActividadesActividadesPageRoute
  '/PagarCupo/updateTripSeats': typeof PagarCupoUpdateTripSeatsRoute
  '/RegistrarVehiculo/DocumentForm': typeof RegistrarVehiculoDocumentFormRoute
  '/RegistrarVehiculo/DocumentsRequired': typeof RegistrarVehiculoDocumentsRequiredRoute
  '/RegistrarVehiculo/License': typeof RegistrarVehiculoLicenseRoute
  '/RegistrarVehiculo/PropertyCard': typeof RegistrarVehiculoPropertyCardRoute
  '/RegistrarVehiculo/Soat': typeof RegistrarVehiculoSoatRoute
  '/Reservas/TripReservationModal': typeof ReservasTripReservationModalRoute
  '/Actividades': typeof ActividadesIndexRoute
  '/CompletarRegistro': typeof CompletarRegistroIndexRoute
  '/ConfirmarCupo': typeof ConfirmarCupoIndexRoute
  '/Cupones': typeof CuponesIndexRoute
  '/DateSelected': typeof DateSelectedIndexRoute
  '/Destino': typeof DestinoIndexRoute
  '/DetallesViaje': typeof DetallesViajeIndexRoute
  '/Login': typeof LoginIndexRoute
  '/Origen': typeof OrigenIndexRoute
  '/PagarCupo': typeof PagarCupoIndexRoute
  '/Paradas': typeof ParadasIndexRoute
  '/RecuperarPasword': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo': typeof RegistrarVehiculoIndexRoute
  '/Registro': typeof RegistroIndexRoute
  '/Reservas': typeof ReservasIndexRoute
  '/account': typeof AccountIndexRoute
  '/home': typeof HomeIndexRoute
  '/perfil': typeof PerfilIndexRoute
  '/publicarviaje': typeof PublicarviajeIndexRoute
  '/reservar': typeof ReservarIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/Actividades/ActividadesPage': typeof ActividadesActividadesPageRoute
  '/PagarCupo/updateTripSeats': typeof PagarCupoUpdateTripSeatsRoute
  '/RegistrarVehiculo/DocumentForm': typeof RegistrarVehiculoDocumentFormRoute
  '/RegistrarVehiculo/DocumentsRequired': typeof RegistrarVehiculoDocumentsRequiredRoute
  '/RegistrarVehiculo/License': typeof RegistrarVehiculoLicenseRoute
  '/RegistrarVehiculo/PropertyCard': typeof RegistrarVehiculoPropertyCardRoute
  '/RegistrarVehiculo/Soat': typeof RegistrarVehiculoSoatRoute
  '/Reservas/TripReservationModal': typeof ReservasTripReservationModalRoute
  '/Actividades': typeof ActividadesIndexRoute
  '/CompletarRegistro': typeof CompletarRegistroIndexRoute
  '/ConfirmarCupo': typeof ConfirmarCupoIndexRoute
  '/Cupones': typeof CuponesIndexRoute
  '/DateSelected': typeof DateSelectedIndexRoute
  '/Destino': typeof DestinoIndexRoute
  '/DetallesViaje': typeof DetallesViajeIndexRoute
  '/Login': typeof LoginIndexRoute
  '/Origen': typeof OrigenIndexRoute
  '/PagarCupo': typeof PagarCupoIndexRoute
  '/Paradas': typeof ParadasIndexRoute
  '/RecuperarPasword': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo': typeof RegistrarVehiculoIndexRoute
  '/Registro': typeof RegistroIndexRoute
  '/Reservas': typeof ReservasIndexRoute
  '/account': typeof AccountIndexRoute
  '/home': typeof HomeIndexRoute
  '/perfil': typeof PerfilIndexRoute
  '/publicarviaje': typeof PublicarviajeIndexRoute
  '/reservar': typeof ReservarIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/Actividades/ActividadesPage': typeof ActividadesActividadesPageRoute
  '/PagarCupo/updateTripSeats': typeof PagarCupoUpdateTripSeatsRoute
  '/RegistrarVehiculo/DocumentForm': typeof RegistrarVehiculoDocumentFormRoute
  '/RegistrarVehiculo/DocumentsRequired': typeof RegistrarVehiculoDocumentsRequiredRoute
  '/RegistrarVehiculo/License': typeof RegistrarVehiculoLicenseRoute
  '/RegistrarVehiculo/PropertyCard': typeof RegistrarVehiculoPropertyCardRoute
  '/RegistrarVehiculo/Soat': typeof RegistrarVehiculoSoatRoute
  '/Reservas/TripReservationModal': typeof ReservasTripReservationModalRoute
  '/Actividades/': typeof ActividadesIndexRoute
  '/CompletarRegistro/': typeof CompletarRegistroIndexRoute
  '/ConfirmarCupo/': typeof ConfirmarCupoIndexRoute
  '/Cupones/': typeof CuponesIndexRoute
  '/DateSelected/': typeof DateSelectedIndexRoute
  '/Destino/': typeof DestinoIndexRoute
  '/DetallesViaje/': typeof DetallesViajeIndexRoute
  '/Login/': typeof LoginIndexRoute
  '/Origen/': typeof OrigenIndexRoute
  '/PagarCupo/': typeof PagarCupoIndexRoute
  '/Paradas/': typeof ParadasIndexRoute
  '/RecuperarPasword/': typeof RecuperarPaswordIndexRoute
  '/RegistrarDatos/': typeof RegistrarDatosIndexRoute
  '/RegistrarVehiculo/': typeof RegistrarVehiculoIndexRoute
  '/Registro/': typeof RegistroIndexRoute
  '/Reservas/': typeof ReservasIndexRoute
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
    | '/Actividades/ActividadesPage'
    | '/PagarCupo/updateTripSeats'
    | '/RegistrarVehiculo/DocumentForm'
    | '/RegistrarVehiculo/DocumentsRequired'
    | '/RegistrarVehiculo/License'
    | '/RegistrarVehiculo/PropertyCard'
    | '/RegistrarVehiculo/Soat'
    | '/Reservas/TripReservationModal'
    | '/Actividades'
    | '/CompletarRegistro'
    | '/ConfirmarCupo'
    | '/Cupones'
    | '/DateSelected'
    | '/Destino'
    | '/DetallesViaje'
    | '/Login'
    | '/Origen'
    | '/PagarCupo'
    | '/Paradas'
    | '/RecuperarPasword'
    | '/RegistrarDatos'
    | '/RegistrarVehiculo'
    | '/Registro'
    | '/Reservas'
    | '/account'
    | '/home'
    | '/perfil'
    | '/publicarviaje'
    | '/reservar'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/Actividades/ActividadesPage'
    | '/PagarCupo/updateTripSeats'
    | '/RegistrarVehiculo/DocumentForm'
    | '/RegistrarVehiculo/DocumentsRequired'
    | '/RegistrarVehiculo/License'
    | '/RegistrarVehiculo/PropertyCard'
    | '/RegistrarVehiculo/Soat'
    | '/Reservas/TripReservationModal'
    | '/Actividades'
    | '/CompletarRegistro'
    | '/ConfirmarCupo'
    | '/Cupones'
    | '/DateSelected'
    | '/Destino'
    | '/DetallesViaje'
    | '/Login'
    | '/Origen'
    | '/PagarCupo'
    | '/Paradas'
    | '/RecuperarPasword'
    | '/RegistrarDatos'
    | '/RegistrarVehiculo'
    | '/Registro'
    | '/Reservas'
    | '/account'
    | '/home'
    | '/perfil'
    | '/publicarviaje'
    | '/reservar'
  id:
    | '__root__'
    | '/'
    | '/Actividades/ActividadesPage'
    | '/PagarCupo/updateTripSeats'
    | '/RegistrarVehiculo/DocumentForm'
    | '/RegistrarVehiculo/DocumentsRequired'
    | '/RegistrarVehiculo/License'
    | '/RegistrarVehiculo/PropertyCard'
    | '/RegistrarVehiculo/Soat'
    | '/Reservas/TripReservationModal'
    | '/Actividades/'
    | '/CompletarRegistro/'
    | '/ConfirmarCupo/'
    | '/Cupones/'
    | '/DateSelected/'
    | '/Destino/'
    | '/DetallesViaje/'
    | '/Login/'
    | '/Origen/'
    | '/PagarCupo/'
    | '/Paradas/'
    | '/RecuperarPasword/'
    | '/RegistrarDatos/'
    | '/RegistrarVehiculo/'
    | '/Registro/'
    | '/Reservas/'
    | '/account/'
    | '/home/'
    | '/perfil/'
    | '/publicarviaje/'
    | '/reservar/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  ActividadesActividadesPageRoute: typeof ActividadesActividadesPageRoute
  PagarCupoUpdateTripSeatsRoute: typeof PagarCupoUpdateTripSeatsRoute
  RegistrarVehiculoDocumentFormRoute: typeof RegistrarVehiculoDocumentFormRoute
  RegistrarVehiculoDocumentsRequiredRoute: typeof RegistrarVehiculoDocumentsRequiredRoute
  RegistrarVehiculoLicenseRoute: typeof RegistrarVehiculoLicenseRoute
  RegistrarVehiculoPropertyCardRoute: typeof RegistrarVehiculoPropertyCardRoute
  RegistrarVehiculoSoatRoute: typeof RegistrarVehiculoSoatRoute
  ReservasTripReservationModalRoute: typeof ReservasTripReservationModalRoute
  ActividadesIndexRoute: typeof ActividadesIndexRoute
  CompletarRegistroIndexRoute: typeof CompletarRegistroIndexRoute
  ConfirmarCupoIndexRoute: typeof ConfirmarCupoIndexRoute
  CuponesIndexRoute: typeof CuponesIndexRoute
  DateSelectedIndexRoute: typeof DateSelectedIndexRoute
  DestinoIndexRoute: typeof DestinoIndexRoute
  DetallesViajeIndexRoute: typeof DetallesViajeIndexRoute
  LoginIndexRoute: typeof LoginIndexRoute
  OrigenIndexRoute: typeof OrigenIndexRoute
  PagarCupoIndexRoute: typeof PagarCupoIndexRoute
  ParadasIndexRoute: typeof ParadasIndexRoute
  RecuperarPaswordIndexRoute: typeof RecuperarPaswordIndexRoute
  RegistrarDatosIndexRoute: typeof RegistrarDatosIndexRoute
  RegistrarVehiculoIndexRoute: typeof RegistrarVehiculoIndexRoute
  RegistroIndexRoute: typeof RegistroIndexRoute
  ReservasIndexRoute: typeof ReservasIndexRoute
  AccountIndexRoute: typeof AccountIndexRoute
  HomeIndexRoute: typeof HomeIndexRoute
  PerfilIndexRoute: typeof PerfilIndexRoute
  PublicarviajeIndexRoute: typeof PublicarviajeIndexRoute
  ReservarIndexRoute: typeof ReservarIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  ActividadesActividadesPageRoute: ActividadesActividadesPageRoute,
  PagarCupoUpdateTripSeatsRoute: PagarCupoUpdateTripSeatsRoute,
  RegistrarVehiculoDocumentFormRoute: RegistrarVehiculoDocumentFormRoute,
  RegistrarVehiculoDocumentsRequiredRoute:
    RegistrarVehiculoDocumentsRequiredRoute,
  RegistrarVehiculoLicenseRoute: RegistrarVehiculoLicenseRoute,
  RegistrarVehiculoPropertyCardRoute: RegistrarVehiculoPropertyCardRoute,
  RegistrarVehiculoSoatRoute: RegistrarVehiculoSoatRoute,
  ReservasTripReservationModalRoute: ReservasTripReservationModalRoute,
  ActividadesIndexRoute: ActividadesIndexRoute,
  CompletarRegistroIndexRoute: CompletarRegistroIndexRoute,
  ConfirmarCupoIndexRoute: ConfirmarCupoIndexRoute,
  CuponesIndexRoute: CuponesIndexRoute,
  DateSelectedIndexRoute: DateSelectedIndexRoute,
  DestinoIndexRoute: DestinoIndexRoute,
  DetallesViajeIndexRoute: DetallesViajeIndexRoute,
  LoginIndexRoute: LoginIndexRoute,
  OrigenIndexRoute: OrigenIndexRoute,
  PagarCupoIndexRoute: PagarCupoIndexRoute,
  ParadasIndexRoute: ParadasIndexRoute,
  RecuperarPaswordIndexRoute: RecuperarPaswordIndexRoute,
  RegistrarDatosIndexRoute: RegistrarDatosIndexRoute,
  RegistrarVehiculoIndexRoute: RegistrarVehiculoIndexRoute,
  RegistroIndexRoute: RegistroIndexRoute,
  ReservasIndexRoute: ReservasIndexRoute,
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
        "/Actividades/ActividadesPage",
        "/PagarCupo/updateTripSeats",
        "/RegistrarVehiculo/DocumentForm",
        "/RegistrarVehiculo/DocumentsRequired",
        "/RegistrarVehiculo/License",
        "/RegistrarVehiculo/PropertyCard",
        "/RegistrarVehiculo/Soat",
        "/Reservas/TripReservationModal",
        "/Actividades/",
        "/CompletarRegistro/",
        "/ConfirmarCupo/",
        "/Cupones/",
        "/DateSelected/",
        "/Destino/",
        "/DetallesViaje/",
        "/Login/",
        "/Origen/",
        "/PagarCupo/",
        "/Paradas/",
        "/RecuperarPasword/",
        "/RegistrarDatos/",
        "/RegistrarVehiculo/",
        "/Registro/",
        "/Reservas/",
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
    "/Actividades/ActividadesPage": {
      "filePath": "Actividades/ActividadesPage.tsx"
    },
    "/PagarCupo/updateTripSeats": {
      "filePath": "PagarCupo/updateTripSeats.tsx"
    },
    "/RegistrarVehiculo/DocumentForm": {
      "filePath": "RegistrarVehiculo/DocumentForm.tsx"
    },
    "/RegistrarVehiculo/DocumentsRequired": {
      "filePath": "RegistrarVehiculo/DocumentsRequired.tsx"
    },
    "/RegistrarVehiculo/License": {
      "filePath": "RegistrarVehiculo/License.tsx"
    },
    "/RegistrarVehiculo/PropertyCard": {
      "filePath": "RegistrarVehiculo/PropertyCard.tsx"
    },
    "/RegistrarVehiculo/Soat": {
      "filePath": "RegistrarVehiculo/Soat.tsx"
    },
    "/Reservas/TripReservationModal": {
      "filePath": "Reservas/TripReservationModal.tsx"
    },
    "/Actividades/": {
      "filePath": "Actividades/index.tsx"
    },
    "/CompletarRegistro/": {
      "filePath": "CompletarRegistro/index.tsx"
    },
    "/ConfirmarCupo/": {
      "filePath": "ConfirmarCupo/index.tsx"
    },
    "/Cupones/": {
      "filePath": "Cupones/index.tsx"
    },
    "/DateSelected/": {
      "filePath": "DateSelected/index.tsx"
    },
    "/Destino/": {
      "filePath": "Destino/index.tsx"
    },
    "/DetallesViaje/": {
      "filePath": "DetallesViaje/index.tsx"
    },
    "/Login/": {
      "filePath": "Login/index.tsx"
    },
    "/Origen/": {
      "filePath": "Origen/index.tsx"
    },
    "/PagarCupo/": {
      "filePath": "PagarCupo/index.tsx"
    },
    "/Paradas/": {
      "filePath": "Paradas/index.tsx"
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
    "/Reservas/": {
      "filePath": "Reservas/index.tsx"
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
