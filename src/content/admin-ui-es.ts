/**
 * Textos de interfaz — consola administrativa (es-MX).
 * Content design: lenguaje claro, sin jerga de implementación (backend, pin, heatmap).
 */

export const adminUiCopy = {
  personas: {
    scopeNotice:
      "Las acciones disponibles dependen de tu rol y del alcance de personas que administras.",
    loadingStructure: "Cargando estructura…",
    pageSubtitle: "Consulta y administra personas según tu rol y alcance.",
  },
  mapa: {
    pageSubtitle:
      "Ubicación de personas en tu alcance. Selecciona un punto en el mapa para ver la ficha.",
    loadingCoverage: "Cargando mapa de cobertura…",
    loadingPerson: "Cargando ficha…",
    filterSearchPlaceholder: "Buscar por nombre",
    needFilterLabel: "Necesidad comunitaria",
    heatmapToggleShow: "Mostrar mapa de concentración",
    heatmapToggleHide: "Ocultar mapa de concentración",
    layersToggleShow: "Mostrar capas y búsqueda",
    layersToggleHide: "Ocultar capas",
    emptyNoLocations:
      "No hay personas con ubicación registrada en tu alcance. Revisa las capas territoriales o el mapa de concentración.",
    emptyNoFilterMatch:
      "Ninguna persona coincide con los filtros actuales. Ajusta el rol o la búsqueda.",
    detailDrawerLabel: "Ficha de la persona seleccionada",
    mapCoordinatesLabel: "Coordenadas en el mapa",
  },
  personDetail: {
    territoryIntro:
      "Geocercas asociadas a personas en la estructura de la persona seleccionada. Solo se muestra información dentro de tu alcance.",
    territoryLoading: "Cargando información territorial…",
    territoryEmpty: (personName: string) =>
      `No hay geocercas registradas para personas en la estructura de ${personName}.`,
    actionsAriaLabel: "Acciones sobre la persona",
    closeDetail: "Cerrar ficha",
  },
  personForm: {
    createIntro: (parentLabel: string) =>
      `La persona se registrará bajo ${parentLabel}. El identificador se asignará automáticamente.`,
    editIntro:
      "Los cambios se aplican a la ficha y quedan visibles para quienes tengan acceso.",
    accessIntro:
      "Esta persona iniciará sesión con correo electrónico y contraseña.",
  },
  destructive: {
    removePersonTitle: "Dar de baja a la persona",
    removePersonConfirm: (personName: string) =>
      `¿Confirmas dar de baja a ${personName}?`,
    removePersonConsequence:
      "Es una baja lógica: dejará de aparecer en la estructura activa y se conserva el historial.",
    confirmLabel: "Dar de baja",
    cancelLabel: "Cancelar",
  },
  eventos: {
    pageSubtitle: "Borradores, publicación y ciclo de vida de eventos.",
    createButton: "Crear evento",
    loadingList: "Cargando eventos…",
    emptyList:
      "No hay eventos administrativos todavía. Crea un borrador para comenzar.",
    actions: {
      publish: "Publicar",
      unpublish: "Despublicar",
      start: "Iniciar",
      finish: "Finalizar",
      cancel: "Cancelar",
      delete: "Dar de baja",
    },
    confirmUnpublish: (eventName: string) =>
      `¿Confirmas despublicar el evento “${eventName}”? Volverá a borrador y dejará de verse públicamente.`,
    confirmCancel: (eventName: string) =>
      `¿Confirmas cancelar el evento “${eventName}”? Dejará de estar disponible públicamente y no podrás reactivarlo.`,
    confirmDelete: (eventName: string) =>
      `¿Confirmas dar de baja el evento “${eventName}”? Es una baja lógica: se conserva el historial y deja de estar disponible.`,
  },
  documentos: {
    registerIntro:
      "Captura los datos del documento. El archivo se guarda en almacenamiento privado y no se muestra en pantalla; la carga completa del archivo estará disponible próximamente.",
  },
} as const;
