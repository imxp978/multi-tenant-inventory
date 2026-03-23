export const getTenantConfig = (tenantId: string) => {
  const base = {
    type: 'mysql' as const,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    connectTimeout: 10000,
    extra: {
      connectionLimit: 5,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    },
  };

  const configs: Record<string, any> = {
    inventory: {
      ...base,
      database: process.env.INVENTORY_DB_NAME,
      username: process.env.INVENTORY_DB_USER,
      password: process.env.INVENTORY_DB_PASS,
    },
    'inventory-demo': {
      ...base,
      database: process.env.INVENTORY_DEMO_DB_NAME,
      username: process.env.INVENTORY_DEMO_DB_USER,
      password: process.env.INVENTORY_DEMO_DB_PASS,
    },
    'inventory-demo2': {
      ...base,
      database: process.env.INVENTORY_DEMO2_DB_NAME,
      username: process.env.INVENTORY_DEMO2_DB_USER,
      password: process.env.INVENTORY_DEMO2_DB_PASS,
    },
  };
  return configs[tenantId];
};

export const tenantIds = ['inventory', 'inventory-demo'];
