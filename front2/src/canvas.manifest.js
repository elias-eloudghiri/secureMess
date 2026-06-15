export const manifest = {
  screens: {
    scr_2a0b5e: {
      name: "Connexion",
      route: "/",
      state: { isAuthenticated: false, authMode: "login" },
      position: { x: 160, y: 220 },
    },
    scr_bo699m: {
      name: "Inscription",
      route: "/",
      state: { isAuthenticated: false, authMode: "register" },
      position: { x: 1560, y: 220 },
    },
    scr_fw5vip: {
      name: "Identifiant généré",
      route: "/",
      state: { isAuthenticated: false, authMode: "show-uuid" },
      position: { x: 2960, y: 220 },
    },
    scr_drpczu: {
      name: "Messagerie",
      route: "/",
      state: { isAuthenticated: true },
      position: { x: 160, y: 2200 },
    },
  },
  sections: {
    sec_ui7fga: {
      name: "Authentication flow",
      x: 0,
      y: 0,
      width: 4320,
      height: 1180,
    },
    sec_qr7h00: { name: "Messaging", x: 0, y: 1980, width: 1520, height: 1180 },
  },
  layers: [
    {
      kind: "section",
      id: "sec_ui7fga",
      children: [
        { kind: "screen", id: "scr_2a0b5e" },
        { kind: "screen", id: "scr_bo699m" },
        { kind: "screen", id: "scr_fw5vip" },
      ],
    },
    {
      kind: "section",
      id: "sec_qr7h00",
      children: [{ kind: "screen", id: "scr_drpczu" }],
    },
  ],
};
