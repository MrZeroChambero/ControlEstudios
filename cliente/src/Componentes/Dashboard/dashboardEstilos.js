const cardBase = "bg-white p-6 rounded-lg shadow-md";
const headingBase = "text-2xl font-bold mb-4 text-gray-800";
const gridGap = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6";
const buttonBase =
  "flex flex-col items-center justify-center p-6 rounded-lg shadow transition-shadow border-2";
const mediaCardBase = "bg-gray-100 p-6 rounded-lg shadow-inner";
const mediaPlaceholder =
  "w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center";
const sidebarBase = "w-64 bg-gray-900 text-gray-300 flex flex-col h-full";
const sidebarHeading = "p-6 bg-gray-800 flex items-center space-x-4";
const navBase = "flex-1 mt-6 px-4 space-y-2 overflow-y-auto sidebar-scroll";
const mainLayoutBase = "font-sans flex h-screen bg-gray-100 text-gray-800";
const mainContentBase = "flex-1 p-8 overflow-y-auto space-y-8";
const dropdownButtonBase =
  "w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors focus:outline-none border";
const dropdownSubitemBase =
  "w-full p-2 text-sm text-left rounded-lg transition-colors focus:outline-none border";

export const dashboardLayoutClasses = {
  container: mainLayoutBase,
  mainContent: mainContentBase,
  sectionWrapper: `${cardBase} mb-8`,
  finalSection: cardBase,
};

export const dashboardSectionClasses = {
  heading: headingBase,
  graphContainer:
    "w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mt-4",
  mediaGrid: "grid grid-cols-1 lg:grid-cols-2 gap-6",
  mediaCard: mediaCardBase,
  mediaPlaceholder,
  mediaImage: "w-full h-auto rounded-lg",
};

export const dashboardQuickActionClasses = {
  grid: gridGap,
  buttonBase,
  icon: "h-10 w-10 mb-2",
  create: `${buttonBase} border-blue-200 bg-blue-50/50 hover:shadow-lg hover:border-blue-500`,
  report: `${buttonBase} border-green-200 bg-green-50/50 hover:shadow-lg hover:border-green-500`,
  settings: `${buttonBase} border-yellow-200 bg-yellow-50/50 hover:shadow-lg hover:border-yellow-500`,
  label: "text-sm font-semibold",
};

export const dashboardSidebarClasses = {
  container: sidebarBase,
  header: sidebarHeading,
  avatar:
    "h-10 w-10 text-white rounded-full bg-blue-500 p-1 flex items-center justify-center",
  username: "font-semibold text-white",
  level: "text-xs text-gray-400",
  nav: navBase,
  footer: "p-4 border-t border-gray-800",
  logoutButton:
    "w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900",
};

export const dashboardMenuItemClasses = {
  button: `${dropdownButtonBase} hover:bg-gray-700 border-gray-700`,
  content: "ml-4 mt-1 space-y-1",
  subItem: `${dropdownSubitemBase} hover:bg-gray-700 border-gray-700`,
  titleWrapper: "flex items-center",
  icon: "w-5 h-5 mr-3",
  arrow: "w-4 h-4 transform transition-transform",
  variants: {
    Entrada: {
      button: "border-blue-500/60 bg-blue-900/30 hover:border-blue-300",
      subItem: "border-blue-500/40 bg-blue-900/10 hover:bg-blue-900/30",
    },
    Proceso: {
      button: "border-amber-500/60 bg-amber-900/20 hover:border-amber-300",
      subItem: "border-amber-500/40 bg-amber-900/10 hover:bg-amber-900/30",
    },
    Salidas: {
      button:
        "border-emerald-500/60 bg-emerald-900/20 hover:border-emerald-300",
      subItem:
        "border-emerald-500/40 bg-emerald-900/10 hover:bg-emerald-900/30",
    },
    Servicios: {
      button: "border-purple-500/60 bg-purple-900/20 hover:border-purple-300",
      subItem: "border-purple-500/40 bg-purple-900/10 hover:bg-purple-900/30",
    },
    default: {
      button: "border-gray-700 bg-gray-900/30",
      subItem: "border-gray-700 bg-gray-900/20",
    },
  },
};
